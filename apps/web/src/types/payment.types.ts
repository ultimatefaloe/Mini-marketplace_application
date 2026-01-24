import type { IBaseDocument, ITimestamps, ObjectId } from "./base.types";
import type { PaymentChannel, PaymentProvider, PaymentStatus } from "./enums";
import type { IOrder } from "./order.types";

export interface IPayment extends IBaseDocument, ITimestamps {
  orderId: ObjectId;
  userId: ObjectId;
  reference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider | string;
  channel?: PaymentChannel | string;
  rawPayload?: Record<string, any>;
}

/**
 * Payment with populated order
 */
export interface IPaymentWithOrder extends Omit<IPayment, 'orderId'> {
  order: IOrder;
}

/**
 * Payment initialization payload
 */
export interface IInitializePaymentPayload {
  orderId: ObjectId;
  amount: number;
  email: string;
  callbackUrl?: string;
}

/**
 * Payment initialization response
 */
export interface IPaymentInitializationResponse {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
}

/**
 * Payment verification response
 */
export interface IPaymentVerificationResponse {
  reference: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paidAt: Date | string;
  channel: PaymentChannel | string;
}

/**
 * Payment webhook payload (Paystack)
 */
export interface IPaymentWebhookPayload {
  event: string;
  data: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    paid_at: string;
    channel: string;
    customer: {
      email: string;
    };
    metadata?: Record<string, any>;
  };
}