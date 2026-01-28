import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from 'src/models/user.schema';
import { Admin, AdminSchema } from 'src/models/admin.schema';
import { NotificationService } from 'src/notifications/notification.service';
import { GoogleStrategy, JwtStrategy, RefreshJwtStrategy } from './strategies';

@Module({
  imports: [
    PassportModule,
    JwtModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshJwtStrategy,
    GoogleStrategy,
    NotificationService,
  ],
  exports: [
    AuthService,
    JwtModule
  ],
})
export class AuthModule { }
