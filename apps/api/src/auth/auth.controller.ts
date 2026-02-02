
import { Controller, Post, Body, Res, UseGuards, Get, Req, HttpCode, HttpStatus, Logger, Patch, UploadedFile } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard, JwtRefreshGuard } from './guards';
import { SignUpDto, AdminSignUpDto, SignInDto, RequestResetDto, ResetPasswordDto } from './dto';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { Public, CurrentUser, Roles } from './decorators';
import { RefreshUser } from './decorators/refresh.decorator';
import { AppRole } from 'src/type';
import { UpdateVendorDto } from './dto/update-vendor';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private cloudinaryService: CloudinaryService
  ) { }

  // ========== USER ROUTES ==========
  @Public()
  @Post('user/signup')
  async userSignUp(@Body() dto: SignUpDto, @Res({ passthrough: true }) res: Response) {
    const { data, tokens } = await this.authService.signUpUser(dto);
    this.setAuthCookies(res, tokens);
    return { success: true, message: 'User registered successfully', data };
  }

  @Public()
  @Post('user/signin')
  @HttpCode(HttpStatus.OK)
  async userSignIn(@Body() dto: SignInDto, @Res({ passthrough: true }) res: Response) {
    const { data, tokens } = await this.authService.signInUser(dto);
    this.setAuthCookies(res, tokens);
    return { success: true, message: 'Signed in successfully', data };
  }

  @Public()
  @Get('user/google')
  @UseGuards(GoogleAuthGuard)
  googleUserAuth() { }

  @Public()
  @Get('user/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleUserCallback(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.googleAuth(req.user, AppRole.USER);
    this.setAuthCookies(res, tokens);
    res.redirect(`${this.config.get<string>('FRONTEND_URL')}`);
  }

  // ========== VENDOR ROUTES ==========
  @Public()
  @Post('vendor/signup')
  async vendorSignUp(
    @Body() dto: CreateVendorDto,
    @Res({ passthrough: true }) res: Response,
    @UploadedFile() file: Express.Multer.File
  ) {
     const result = await this.cloudinaryService.uploadFile(file, 'mini-marketplace/vendor');
    const logoUrl: string = result ? result?.secure_url : dto.businessLogo!
    const { data, tokens } = await this.authService.signUpVendor(dto, logoUrl);
    this.setAuthCookies(res, tokens);
    return {
      success: true,
      message: 'Vendor account created and under review',
      data
    };
  }

  @Public()
  @Post('vendor/signin')
  @HttpCode(HttpStatus.OK)
  async vendorSignIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { data, tokens } = await this.authService.signInVendor(dto);
    this.setAuthCookies(res, tokens);
    return {
      success: true,
      message: 'Signed in successfully',
      data
    };
  }

  @Public()
  @Get('vendor/google')
  @UseGuards(GoogleAuthGuard)
  googleVendorAuth() { }

  @Public()
  @Get('vendor/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleVendorCallback(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.googleAuthVendor(req.user);
    this.setAuthCookies(res, tokens);
    res.redirect(`${this.config.get<string>('FRONTEND_URL')}/vendor/dashboard`);
  }

  @Public()
  @Post('vendor/request-reset')
  @HttpCode(HttpStatus.OK)
  async vendorRequestReset(@Body() dto: RequestResetDto) {
    return this.authService.requestPasswordReset(dto, AppRole.VENDOR);
  }


  // ========== ADMIN ROUTES ==========
  @Public()
  @Post('admin/signup')
  async adminSignUp(@Body() dto: AdminSignUpDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.signUpAdmin(dto);
    this.setAuthCookies(res, tokens);
    return { message: 'Admin registered successfully' };
  }

  @Public()
  @Post('admin/signin')
  @HttpCode(HttpStatus.OK)
  async adminSignIn(@Body() dto: SignInDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.signInAdmin(dto);
    this.setAuthCookies(res, tokens);
    return { message: 'Signed in successfully' };
  }

  @Public()
  @Get('admin/google')
  @UseGuards(GoogleAuthGuard)
  googleAdminAuth() { }

  @Public()
  @Get('admin/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAdminCallback(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.googleAuth(req.user, AppRole.ADMIN);
    this.setAuthCookies(res, tokens);
    res.redirect(`${this.config.get<string>('FRONTEND_URL')}/admin`);
  }

  // ========== PASSWORD RESET ==========
  @Public()
  @Post('user/request-reset')
  @HttpCode(HttpStatus.OK)
  async userRequestReset(@Body() dto: RequestResetDto) {
    return this.authService.requestPasswordReset(dto, AppRole.USER);
  }

  @Public()
  @Post('admin/request-reset')
  @HttpCode(HttpStatus.OK)
  async adminRequestReset(@Body() dto: RequestResetDto) {
    return this.authService.requestPasswordReset(dto, AppRole.ADMIN);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // ========== LOGOUT ==========
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  // ========== TOKEN VALIDATION ==========
  @Get('validate')
  @HttpCode(HttpStatus.OK)
  validateToken(@CurrentUser() user: JwtPayload) {
    return {
      valid: true,
      user: {
        auth_id: user?.auth_id,
        fullName: user?.fullName,
        phone: user?.phone || '',
        email: user?.email,
        role: user?.role,
        isActive: user?.isActive
      },
    };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(
    @RefreshUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = this.authService.generateAccessTokens(user);
    this.setAuthCookies(res, tokens);
    return {
      message: 'Access token refreshed successfully',
    };
  }

  // ========== PRODILES ==========
  @Get('profile')
  @Roles(AppRole.VENDOR)
  getVendorProfile(@CurrentUser() user: JwtPayload) {
    return {
      success: true,
      data: {
        auth_id: user.auth_id,
        email: user.email,
        businessName: user.businessName,
        verified: user.verified,
        accountStatus: user.accountStatus,
        location: user.location,
        role: user.role,
      }
    };
  }

  @Patch('profile')
  @Roles(AppRole.VENDOR)
  async updateVendorProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateVendorDto
  ) { }


  // ========== HELPERS ==========
  private setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken?: string }) {
    res.cookie('access_token', tokens.accessToken, this.authService.getCookieOptions(900000)); // 15 min
    if (tokens.refreshToken) {
      res.cookie('refresh_token', tokens.refreshToken, this.authService.getCookieOptions(604800000)); // 7 days
    }
  }
}