import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AppRole } from 'src/type';

export type VendorDocument = Vendor & Document;

export enum AccountStatus {
  UNDER_REVIEW = 'UNDER_REVIEW',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
}

@Schema({ _id: false })
export class VendorLocation {
  @Prop({ required: true, type: Number })
  lat: number;

  @Prop({ required: true, type: Number })
  lng: number;

  @Prop({ trim: true })
  street?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  state?: string;

  @Prop({ trim: true })
  country?: string;
}

export const VendorLocationSchema = SchemaFactory.createForClass(VendorLocation);

@Schema({ timestamps: true })
export class Vendor {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  businessName: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  logoUrl?: string;

  @Prop({ trim: true })
  idDocument?: string;

  @Prop({ default: false, index: true })
  verified: boolean;

  @Prop({ 
    type: String, 
    enum: Object.values(AccountStatus), 
    default: AccountStatus.UNDER_REVIEW,
    index: true 
  })
  accountStatus: AccountStatus;

  @Prop({ type: String, enum: Object.values(AppRole), default: AppRole.VENDOR })
  role: AppRole;

  @Prop({ type: VendorLocationSchema, required: true })
  location: VendorLocation;

  @Prop({ default: 0.0, min: 0, max: 5 })
  ratingAverage: number;

  @Prop({ default: 0, min: 0 })
  ratingCount: number;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: null })
  refreshToken?: string;

  @Prop({ default: null })
  googleId?: string;

  @Prop({ trim: true })
  phone?: string;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);

// Compound indexes for performance
VendorSchema.index({ email: 1, isActive: 1 });
VendorSchema.index({ accountStatus: 1, verified: 1 });
VendorSchema.index({ 'location.lat': 1, 'location.lng': 1 });