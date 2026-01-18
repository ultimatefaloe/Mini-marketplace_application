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

    const auth_Id = this.generateAuthId();
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.userModel.create({
      auth_Id,
      email: dto.email,
      passwordHash,
      profile: {
        fullName: dto.fullName || '',
        phone: dto.phone || '',
      },
    });

    return this.generateTokens(user._id.toString(), user.auth_Id, user.email, AppRolesEnum.USER, user.isActive);
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

    return this.generateTokens(user._id.toString(), user.auth_Id, user.email, AppRolesEnum.USER, user.isActive);
  }

  // ========== ADMIN AUTH ==========
  async signUpAdmin(dto: AdminSignUpDto) {
    const existing = await this.adminModel.findOne({ email: dto.email });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const auth_Id = this.generateAuthId();
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const admin = await this.adminModel.create({
      auth_Id,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      permissions: dto.permissions || {},
    });

    return this.generateTokens(admin._id.toString(), admin.auth_Id, admin.email, AppRolesEnum.ADMIN, admin.isActive);
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

    return this.generateTokens(admin._id.toString(), admin.auth_Id, admin.email, AppRolesEnum.ADMIN, admin.isActive);
  }

  // ========== GOOGLE AUTH ==========
  async googleAuth(googleUser: any, type: AppRolesEnum) {
    const Model = (type === AppRolesEnum.USER ? this.userModel : this.adminModel) as Model<UserDocument | AdminDocument>;
    let account = await Model.findOne({ email: googleUser.email });

    if (!account) {
      const auth_Id = this.generateAuthId();
      const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12);

      const data: any = {
        auth_Id,
        email: googleUser.email,
        passwordHash,
        googleId: googleUser.googleId,
      };

      if (type === AppRolesEnum.USER) {
        data.profile = { fullName: googleUser.fullName || '', phone: '' };
      } else {
        data.phone = '';
      }

      account = await Model.create(data);
    } else if (!account.googleId) {
      account.googleId = googleUser.googleId;
      await account.save();
    }

    const role = type === AppRolesEnum.ADMIN ? (account as any).role : AppRolesEnum.USER;
    return this.generateTokens(account._id.toString(), account.auth_Id, account.email, role, account.isActive);
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

  // ========== HELPERS ==========
  private async generateTokens(
    id: string,
    auth_Id: string,
    email: string,
    role: AppRoles,
    isActive: boolean
  ) {
    const payload: JwtPayload = {
      id,
      auth_id: auth_Id,
      email,
      role,
      isActive,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET')
        // expiresIn: this.config.get<string>('JWT_EXPIRES_IN'),

      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET')
        // expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return { accessToken, refreshToken };
  }


  private generateAuthId(): string {
    return `${Date.now()}-${randomBytes(8).toString('hex')}`;
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
