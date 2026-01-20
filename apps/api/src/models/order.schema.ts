import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  nameSnapshot: string;

  @Prop({ required: true, min: 0 })
  priceSnapshot: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  subtotal: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

@Schema({ _id: false })
export class ShippingAddress {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, trim: true })
  addressLine1: string;

  @Prop({ trim: true })
  addressLine2: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ required: true, trim: true })
  state: string;

  @Prop({ required: true, trim: true })
  country: string;

  @Prop({ required: true, trim: true })
  postalCode: string;
}

export const ShippingAddressSchema = SchemaFactory.createForClass(ShippingAddress);

@Schema({ timestamps: true })
export class Order {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  orderNumber: string;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  subtotalAmount: number;

  @Prop({ default: 0, min: 0 })
  shippingFee: number;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING_PAYMENT,
    index: true,
  })
  status: OrderStatus;

  @Prop({ type: ShippingAddressSchema, required: true })
  shippingAddress: ShippingAddress;

  @Prop({
    type: Types.ObjectId,
    ref: 'Payment',
    default: null,
    index: true,
  })
  paymentId: Types.ObjectId | null;

  @Prop({ default: null })
  paidAt: Date;

  @Prop({ default: null })
  shippedAt: Date;

  @Prop({ default: null })
  deliveredAt: Date;

  @Prop({ default: null })
  cancelledAt: Date;

  @Prop({ trim: true })
  trackingNumber: string;

  @Prop({ trim: true })
  notes: string;

  @Prop({ trim: true })
  cancellationReason: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Compound indexes for performance
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1, userId: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
