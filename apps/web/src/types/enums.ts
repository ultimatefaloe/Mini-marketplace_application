
export enum UserRole {
  USER = 'USER',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  PENDING = 'PENDING',
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

export enum DeliveryMethod {
  PICK_UP = 'PICK_UP',
  DELIVERY = 'DELIVERY'
}