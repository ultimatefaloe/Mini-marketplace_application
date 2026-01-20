
import { Controller, Post, Body, Res, UseGuards, Get, Req, HttpCode, HttpStatus } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards';
import { SignUpDto, AdminSignUpDto, SignInDto, RequestResetDto, ResetPasswordDto } from './dto';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { AppRolesEnum } from 'src/type/role';
import { Public, Roles, CurrentUser } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService
  ) { }

  // ========== USER ROUTES ==========
  @Public()
  @Post('user/signup')
  async userSignUp(@Body() dto: SignUpDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.signUpUser(dto);
    this.setAuthCookies(res, tokens);
    return { message: 'User registered successfully' };
  }

  @Public()
  @Post('user/signin')
  @HttpCode(HttpStatus.OK)
  async userSignIn(@Body() dto: SignInDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.signInUser(dto);
    this.setAuthCookies(res, tokens);
    return { message: 'Signed in successfully' };
  }

  @Public()
  @Get('user/google')
  @UseGuards(GoogleAuthGuard)
  googleUserAuth() { }

  @Public()
  @Get('user/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleUserCallback(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.googleAuth(req.user, AppRolesEnum.USER);
    this.setAuthCookies(res, tokens);
    res.redirect(`${this.config.get<string>('FRONTEND_URL')}`);
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
    const tokens = await this.authService.googleAuth(req.user, AppRolesEnum.ADMIN);
    this.setAuthCookies(res, tokens);
    res.redirect(`${this.config.get<string>('FRONTEND_URL')}/admin`);
  }

  // ========== PASSWORD RESET ==========
  @Public()
  @Post('user/request-reset')
  @HttpCode(HttpStatus.OK)
  async userRequestReset(@Body() dto: RequestResetDto) {
    return this.authService.requestPasswordReset(dto, AppRolesEnum.USER);
  }

  @Public()
  @Post('admin/request-reset')
  @HttpCode(HttpStatus.OK)
  async adminRequestReset(@Body() dto: RequestResetDto) {
    return this.authService.requestPasswordReset(dto, AppRolesEnum.ADMIN);
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
        auth_id: user.auth_id,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      },
    };
  }

  // ========== PRODILES ==========
  // @Get('user/profile')
  // getUserProfile(@CurrentUser() user: JwtPayload) { }

  // @Get('admin/profile')
  // @Roles('ADMIN', 'SUPER_ADMIN')
  // getAdminProfile(@CurrentUser() user: JwtPayload) { }

  // ========== HELPERS ==========
  private setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    res.cookie('access_token', tokens.accessToken, this.authService.getCookieOptions(900000)); // 15 min
    res.cookie('refresh_token', tokens.refreshToken, this.authService.getCookieOptions(604800000)); // 7 days
  }
}