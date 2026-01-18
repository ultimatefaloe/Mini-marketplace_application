import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId })
  productId: Types.ObjectId;

  @Prop()
  nameSnapshot: string;

  @Prop()
  priceSnapshot: number;

  @Prop()
  quantity: number;

  @Prop()
  subtotal: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Order {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  @Prop({ required: true })
  totalAmount: number; // kobo

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING_PAYMENT,
  })
  status: OrderStatus;

  @Prop({
    type: Types.ObjectId,
    ref: 'Payment',
    default: null,
  })
  paymentId: Types.ObjectId | null;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
