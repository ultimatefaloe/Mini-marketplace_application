import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor
    (
      private reflector: Reflector,
      private readonly config: ConfigService,
      private readonly jwt: JwtService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest();

    const token =
      req.cookies?.access_token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      throw new UnauthorizedException('Access token not found');
    }


    const secret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET')

    const validate = await this.jwt.verify(token, { secret })

    if (!validate) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }
    req.token = token;

    return super.canActivate(context) as Promise<boolean>;
  }
}