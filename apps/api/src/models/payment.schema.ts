import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({
    type: Types.ObjectId,
    ref: 'Order',
  })
  orderId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
  })
  reference: string;

  @Prop()
  amount: number; // kobo

  @Prop({ default: 'NGN' })
  currency: string;

  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Prop({ default: 'PAYSTACK' })
  provider: string;

  @Prop()
  channel: string; // card, bank, ussd

  @Prop({ type: Object })
  rawPayload: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
