import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { SignUpDto, AdminSignUpDto, SignInDto, RequestResetDto, ResetPasswordDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User, UserDocument } from 'src/models/user.schema';
import { Admin, AdminDocument } from 'src/models/admin.schema';
import { NotificationService } from 'src/notifications/notification.service';
import { AppRolesEnum, AppRoles } from 'src/type/role';

@Injectable()
export class AuthService {
  private resetTokens = new Map<string, { email: string; type: AppRoles; exp: number }>();

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private jwtService: JwtService,
    private config: ConfigService,
    private notificationService: NotificationService
  ) { }

  // ========== USER AUTH ==========
  async signUpUser(dto: SignUpDto) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.userModel.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName || '',
      phone: dto.phone || '',
      isActive: true
    });

    const payload = this.parseUserToJwtPayload(user, AppRolesEnum.USER);
    return this.generateTokens(payload);
  }

  async signInUser(dto: SignInDto) {
    const user = await this.userModel
      .findOne({ email: dto.email, isActive: true })
      .select('+passwordHash');

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = this.parseUserToJwtPayload(user, AppRolesEnum.USER);

    return this.generateTokens(payload);
  }

  // ========== ADMIN AUTH ==========
  async signUpAdmin(dto: AdminSignUpDto) {
    const existing = await this.adminModel.findOne({ email: dto.email });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const admin = await this.adminModel.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: dto.permissions ? 'ADMIN' : 'SUPER_ADMIN',
      permissions: dto.permissions || {},
    });

    const payload = this.parseUserToJwtPayload(admin, AppRolesEnum.ADMIN);

    return this.generateTokens(payload);
  }

  async signInAdmin(dto: SignInDto) {
    const admin = await this.adminModel
      .findOne({ email: dto.email, isActive: true })
      .select('+passwordHash');

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = this.parseUserToJwtPayload(admin, AppRolesEnum.ADMIN);

    return this.generateTokens(payload);
  }

  // ========== GOOGLE AUTH ==========
  async googleAuth(googleUser: any, type: AppRolesEnum) {
    const Model = (type === AppRolesEnum.USER ? this.userModel : this.adminModel) as Model<UserDocument | AdminDocument>;
    let account = await Model.findOne({ email: googleUser.email });

    if (!account) {
      const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12);

      const data: any = {
        fullName: googleUser.fullName,
        phone: googleUser.phone ?? "",
        email: googleUser.email,
        passwordHash,
        googleId: googleUser.googleId,
      };

      account = await Model.create(data);
    } else if (!account.googleId) {
      account.googleId = googleUser.googleId;
      await account.save();
    }

    const role = type === AppRolesEnum.ADMIN ? (account as any).role : AppRolesEnum.USER;
    const payload = this.parseUserToJwtPayload(account, role);

    return this.generateTokens(payload);
  }

  // ========== PASSWORD RESET ==========
  async requestPasswordReset(dto: RequestResetDto, type: AppRoles) {
    const Model = (type === AppRolesEnum.USER ? this.userModel : this.adminModel) as Model<UserDocument | AdminDocument>;
    const account = await Model.findOne({ email: dto.email, isActive: true });

    if (!account) {
      // Don't reveal if email exists
      return { message: 'If email exists, reset link sent' };
    }

    const token = randomBytes(32).toString('hex');
    this.resetTokens.set(token, {
      email: dto.email,
      type,
      exp: Date.now() + 3600000, // 1 hour
    });

    const frontendUrl = this.config.get<string>('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}&type=${type}`;

    // Non-blocking email send
    this.notificationService.sendEmail({
      to: dto.email,
      subject: 'Reset Password Link',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
    });

    return { message: 'If email exists, reset link sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenData = this.resetTokens.get(dto.token);

    if (!tokenData || tokenData.exp < Date.now()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const Model = (tokenData.type === AppRolesEnum.USER ? this.userModel : this.adminModel) as Model<UserDocument | AdminDocument>;
    const account = await Model.findOne({ email: tokenData.email });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    account.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await account.save();

    this.resetTokens.delete(dto.token);

    return { message: 'Password reset successful' };
  }



  private parseUserToJwtPayload(
    user: any,
    role: AppRolesEnum
  ): JwtPayload {
    // Convert mongoose document → plain object safely
    const plainUser = typeof user.toObject === 'function'
      ? user.toObject()
      : user;

    return {
      auth_id: plainUser._id.toString(),
      fullName: plainUser.fullName,
      email: plainUser.email,
      phone: plainUser.phone,
      role,
      isActive: plainUser.isActive,
    };
  }


  // ========== HELPERS ==========
  generateTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: '21d',
    });

    return { accessToken, refreshToken };
  }

  generateAccessTokens(user: JwtPayload) {
    const payload: JwtPayload = {
      auth_id: user.auth_id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      role: user.role
    }
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '15m',
    });

    return { accessToken };
  }

  getCookieOptions(maxAge: number) {
    return {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict' as const,
      maxAge,
    };
  }
}
