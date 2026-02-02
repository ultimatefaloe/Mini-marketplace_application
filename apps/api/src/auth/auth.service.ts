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
import { AppRole } from 'src/type/role';
import { Vendor, VendorDocument } from 'src/models/vendor.schema';
import { CreateVendorDto } from './dto/create-vendor.dto';

export type UserAuthType = {
  fullName: string;
  email: string;
  phone: string;
  role: AppRole;
  isActive: boolean;
}
@Injectable()
export class AuthService {
  private resetTokens = new Map<string, { email: string; role: AppRole; exp: number }>();

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
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

    const payload = this.parseUserToJwtPayload(user, AppRole.USER);
    return {
      data: payload,
      tokens: this.generateTokens(payload)
    }
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
    const payload = this.parseUserToJwtPayload(user, AppRole.USER);

    return {
      data: payload,
      tokens: this.generateTokens(payload)
    };
  }

  // ========== VENDOR AUTH ==========
  async signUpVendor(dto: CreateVendorDto, logoUrl: string) {
    const existing = await this.vendorModel.findOne({ email: dto.email });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const vendor = await this.vendorModel.create({
      email: dto.email,
      passwordHash,
      businessName: dto.businessName,
      description: dto.description,
      logoUrl,
      idDocument: dto.idDocument,
      phone: dto.phone,
      location: dto.location,
    });

    // Send welcome email (non-blocking)
    this.notificationService.sendEmail({
      to: dto.email,
      subject: 'Welcome to Our Platform - Vendor Account Under Review',
      html: `<p>Hi ${dto.businessName},</p>
             <p>Your vendor account has been created and is under review. We'll notify you once approved.</p>`,
    });

    const tokens = await this.generateVendorTokens(vendor);

    return {
      data: this.toVendorEntity(vendor),
      tokens,
    };
  }

  async signInVendor(dto: SignInDto) {
    const vendor = await this.vendorModel
      .findOne({ email: dto.email, isActive: true })
      .select('+passwordHash');

    if (!vendor) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, vendor.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateVendorTokens(vendor);

    return {
      data: this.toVendorEntity(vendor),
      tokens,
    };
  }

  async googleAuthVendor(googleUser: any) {
    let vendor = await this.vendorModel.findOne({ email: googleUser.email });

    if (!vendor) {
      throw new BadRequestException(
        'Vendor account not found. Please sign up with complete business information.'
      );
    }

    if (!vendor.googleId) {
      vendor.googleId = googleUser.googleId;
      await vendor.save();
    }

    return this.generateVendorTokens(vendor);
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

    const payload = this.parseUserToJwtPayload(admin, AppRole.ADMIN);

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
    const payload = this.parseUserToJwtPayload(admin, AppRole.ADMIN);

    return this.generateTokens(payload);
  }

  // ========== GOOGLE AUTH ==========
  async googleAuth(googleUser: any, type: AppRole) {
    const Model = (type === AppRole.USER ? this.userModel : this.adminModel) as Model<UserDocument | AdminDocument>;
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

    const role = type === AppRole.ADMIN ? (account as any).role : AppRole.USER;
    const payload = this.parseUserToJwtPayload(account, role);

    return this.generateTokens(payload);
  }

  // ========== UNIVERSAL PASSWORD RESET (works for all roles) ==========
  async requestPasswordReset(dto: RequestResetDto, role: AppRole) {
    let Model: Model<any>;
    let account: any;

    switch (role) {
      case AppRole.USER:
        Model = this.userModel;
        break;
      case AppRole.ADMIN:
      case AppRole.SUPER_ADMIN:
        Model = this.adminModel;
        break;
      case AppRole.VENDOR:
        Model = this.vendorModel;
        break;
      default:
        throw new BadRequestException('Invalid role');
    }

    account = await Model.findOne({ email: dto.email, isActive: true });

    if (!account) {
      return { success: true, message: 'If email exists, reset link sent' };
    }

    const token = randomBytes(32).toString('hex');
    this.resetTokens.set(token, {
      email: dto.email,
      role,
      exp: Date.now() + 3600000, // 1 hour
    });

    const frontendUrl = this.config.get<string>('FRONTEND_URL');
    const resetPath = role === AppRole.VENDOR ? 'vendor' : role.toLowerCase();
    const resetUrl = `${frontendUrl}/${resetPath}/reset-password?token=${token}`;

    // Non-blocking email send
    this.notificationService.sendEmail({
      to: dto.email,
      subject: 'Reset Password Link',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
    });

    return { success: true, message: 'If email exists, reset link sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenData = this.resetTokens.get(dto.token);

    if (!tokenData || tokenData.exp < Date.now()) {
      throw new BadRequestException('Invalid or expired token');
    }

    let Model: Model<any>;

    switch (tokenData.role) {
      case AppRole.USER:
        Model = this.userModel;
        break;
      case AppRole.ADMIN:
      case AppRole.SUPER_ADMIN:
        Model = this.adminModel;
        break;
      case AppRole.VENDOR:
        Model = this.vendorModel;
        break;
      default:
        throw new BadRequestException('Invalid role');
    }

    const account = await Model.findOne({ email: tokenData.email });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    account.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await account.save();

    this.resetTokens.delete(dto.token);

    return { success: true, message: 'Password reset successful' };
  }

  // ========== HELPERS ==========
  private parseUserToJwtPayload(
    user: any,
    role: AppRole
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

  private toVendorEntity(vendor: VendorDocument) {
    return {
      auth_id: vendor._id.toString(),
      email: vendor.email,
      businessName: vendor.businessName,
      description: vendor.description,
      logoUrl: vendor.logoUrl,
      verified: vendor.verified,
      accountStatus: vendor.accountStatus,
      role: vendor.role,
      location: vendor.location,
      ratingAverage: vendor.ratingAverage,
      ratingCount: vendor.ratingCount,
      phone: vendor.phone,
      // createdAt: vendor.createdAt,
    };
  }

  // ========== VENDOR TOKEN GENERATION ==========
  private async generateVendorTokens(vendor: VendorDocument) {
    const payload: JwtPayload = {
      auth_id: vendor._id.toString(),
      email: vendor.email,
      role: AppRole.VENDOR,
      businessName: vendor.businessName,
      verified: vendor.verified,
      accountStatus: vendor.accountStatus,
      location: {
        lat: vendor.location.lat,
        lng: vendor.location.lng,
        city: vendor.location.city,
        state: vendor.location.state,
      },
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: '15m',
      }),

      this.jwtService.sign(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: '21d',
      })
    ]);

    // Store refresh token
    vendor.refreshToken = await bcrypt.hash(refreshToken, 10);
    await vendor.save();

    return { accessToken, refreshToken };
  }

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
