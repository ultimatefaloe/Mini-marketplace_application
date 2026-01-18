import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true, unique: true, index: true })
  auth_Id: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ default: 'ADMIN', enum: ['ADMIN', 'SUPER_ADMIN'], index: true })
  role: string;

  @Prop({
    type: {
      manageProducts: { type: Boolean, default: true },
      manageOrders: { type: Boolean, default: true },
      managePayments: { type: Boolean, default: true },
    },
    _id: false,
  })
  permissions: {
    manageProducts: boolean;
    manageOrders: boolean;
    managePayments: boolean;
  };

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: null })
  refreshToken?: string;

  @Prop({ default: null })
  googleId?: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

// Compound index for common queries
AdminSchema.index({ email: 1, isActive: 1 });
AdminSchema.index({ auth_Id: 1, isActive: 1 });
