import type { IAddress } from "./address.type";
import type { IBaseDocument, ITimestamps, ObjectId } from "./base.types";
import type { DeliveryMethod, OrderStatus } from "./enums";
import type { IPayment } from "./payment.types";
import type { IUser } from "./user.types";

export interface IOrderItem {
  productId: ObjectId;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  subtotal: number;
}

/**
 * Order base interface
 */
export interface IOrder extends IBaseDocument, ITimestamps {
  userId: ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  subtotalAmount: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: IAddress;
  paymentId: ObjectId | null;
  paidAt: Date | string | null;
  shippedAt: Date | string | null;
  deliveredAt: Date | string | null;
  cancelledAt: Date | string | null;
  trackingNumber?: string;
  notes?: string;
  cancellationReason?: string;
}

/**
 * Order with populated user and payment
 */
export interface IOrderWithRelations extends Omit<IOrder, 'userId' | 'paymentId'> {
  user: IUser;
  payment?: IPayment;
}

/**
 * Order list item (lightweight)
 */
export interface IOrderListItem {
  _id: ObjectId;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  itemCount: number;
  createdAt: Date | string;
  paidAt?: Date | string | null;
}

/**
 * Order creation payload
 */
export interface ICreateOrderPayload {
  items: Array<{
    productId: ObjectId;
    quantity: number;
  }>;
  addressId?: string;
  deliveryMethod: DeliveryMethod;
  notes?: string;
}

/**
 * Order status update payload
 */
export interface IUpdateOrderStatusPayload {
  status: OrderStatus;
  trackingNumber?: string;
  notes?: string;
}

/**
 * Order cancellation payload
 */
export interface ICancelOrderPayload {
  reason?: string;
}

/**
 * Order query filters
 */
export interface IOrderQueryFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  userId?: ObjectId;
  orderNumber?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Order statistics
 */
export interface IOrderStats {
  total: number;
  totalRevenue: number;
  byStatus: Record<OrderStatus, {
    count: number;
    totalAmount: number;
  }>;
}
