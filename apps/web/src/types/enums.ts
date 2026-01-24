
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum PaymentProvider {
  PAYSTACK = 'PAYSTACK',
  STRIPE = 'STRIPE',
  FLUTTERWAVE = 'FLUTTERWAVE',
}

export enum PaymentChannel {
  CARD = 'card',
  BANK = 'bank',
  USSD = 'ussd',
  BANK_TRANSFER = 'bank_transfer',
  QR = 'qr',
}