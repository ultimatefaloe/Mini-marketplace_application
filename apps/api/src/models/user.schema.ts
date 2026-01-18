import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class UserProfile {
  @Prop({ trim: true })
  fullName: string;

  @Prop({ trim: true })
  phone: string;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  auth_Id: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ type: UserProfileSchema, default: {} })
  profile: UserProfile;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: null })
  refreshToken?: string;

  @Prop({ default: null })
  googleId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Compound indexes
UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ auth_Id: 1, isActive: 1 });
