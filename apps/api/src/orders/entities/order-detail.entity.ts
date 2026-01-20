export class OrderDetailEntity {
  _id: string;
  orderNumber: string;
  userId: string;
  items: any[];
  subtotalAmount: number;
  shippingFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: string;
  shippingAddress: any;
  paymentId?: string;
  paidAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}