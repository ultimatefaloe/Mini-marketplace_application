import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const refreshToken = request.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const secret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET')

    const validate = await this.jwt.verify(refreshToken, { secret })

    if (!validate) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    request.token = refreshToken;
    // Delegate signature + expiry validation to passport
    return (await super.canActivate(context)) as boolean;
  }
}
