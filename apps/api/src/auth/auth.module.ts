import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from 'src/models/user.schema';
import { Admin, AdminSchema } from 'src/models/admin.schema';
import { NotificationService } from 'src/notifications/notification.service';
import { GoogleStrategy, JwtStrategy, RefreshJwtStrategy } from './strategies';
import { Vendor, VendorSchema } from 'src/models/vendor.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Vendor.name, schema: VendorSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshJwtStrategy,
    GoogleStrategy,
    NotificationService,
    CloudinaryService
  ],
  exports: [
    AuthService,
    JwtModule,
  ],
})
export class AuthModule { }
