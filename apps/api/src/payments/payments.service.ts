import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { Order, OrderDocument, OrderStatus } from 'src/models/order.schema';
import { Payment, PaymentDocument, PaymentStatus } from 'src/models/payment.schema';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    paid_at: string;
    customer: {
      email: string;
    };
    metadata?: any;
  };
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly paystackSecretKey: string;
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.paystackSecretKey = this.configService.getOrThrow<string>(
      'PAYSTACK_SECRET_KEY',
    );
    if (!this.paystackSecretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not defined in environment');
    }
  }

  async initializePayment(
    orderId: string,
    user: JwtPayload,
    callbackUrl?: string,
  ): Promise<PaystackInitializeResponse['data']> {
    const { auth_id, email } = user
    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(orderId),
      userId: new Types.ObjectId(auth_id),
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException(
        `Order is not pending payment. Current status: ${order.status}`,
      );
    }

    // Generate unique reference
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const payment = await this.paymentModel.create({
      orderId: order._id,
      userId: new Types.ObjectId(auth_id),
      reference,
      amount: order.totalAmount,
      currency: 'NGN',
      status: PaymentStatus.PENDING,
      provider: 'PAYSTACK',
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post<PaystackInitializeResponse>(
          `${this.paystackBaseUrl}/transaction/initialize`,
          {
            email,
            amount: order.totalAmount, // Amount in kobo
            reference,
            callback_url: callbackUrl,
            metadata: {
              orderId: orderId,
              userId: auth_id,
              orderNumber: order.orderNumber,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.paystackSecretKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (!response.data.status) {
        throw new InternalServerErrorException(
          'Failed to initialize payment with Paystack',
        );
      }

      this.logger.log(
        `Payment initialized: ${reference} for order ${order.orderNumber}`,
      );

      return response.data.data;
    } catch (error) {
      await this.paymentModel.findByIdAndUpdate(payment._id, {
        status: PaymentStatus.FAILED,
      });

      this.logger.error(
        `Failed to initialize payment: ${error.message}`,
        error.stack,
      );

      if (error.response?.data?.message) {
        throw new BadRequestException(error.response.data.message);
      }

      throw new InternalServerErrorException(
        'Failed to initialize payment. Please try again.',
      );
    }
  }

  async verifyPayment(reference: string): Promise<Payment> {
    const payment = await this.paymentModel.findOne({ reference });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      this.logger.warn(`Payment already verified: ${reference}`);
      return payment;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<PaystackVerifyResponse>(
          `${this.paystackBaseUrl}/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${this.paystackSecretKey}`,
            },
          },
        ),
      );

      const { data } = response.data;

      if (!response.data.status) {
        throw new BadRequestException('Payment verification failed');
      }

      // Update payment record
      const updatedPayment = await this.paymentModel.findByIdAndUpdate(
        payment._id,
        {
          status:
            data.status === 'success'
              ? PaymentStatus.SUCCESS
              : PaymentStatus.FAILED,
          channel: data.channel,
          rawPayload: data,
        },
        { new: true },
      );

      // Update order if payment successful
      if (data.status === 'success') {
        await this.updateOrderAfterPayment(payment.orderId, payment._id);
        this.logger.log(`Payment verified successfully: ${reference}`);
      } else {
        this.logger.warn(`Payment verification failed: ${reference}`);
      }

      return updatedPayment as Payment;
    } catch (error) {
      this.logger.error(
        `Failed to verify payment: ${error.message}`,
        error.stack,
      );

      if (error.response?.data?.message) {
        throw new BadRequestException(error.response.data.message);
      }

      throw new InternalServerErrorException(
        'Failed to verify payment. Please contact support.',
      );
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<void> {
    // Verify webhook signature
    if (!this.verifyWebhookSignature(payload, signature)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = payload.event;
    const data = payload.data;

    this.logger.log(`Webhook received: ${event}`);

    switch (event) {
      case 'charge.success':
        await this.handleSuccessfulCharge(data);
        break;
      case 'charge.failed':
        await this.handleFailedCharge(data);
        break;
      default:
        this.logger.log(`Unhandled webhook event: ${event}`);
    }
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.paystackSecretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }

  private async handleSuccessfulCharge(data: any): Promise<void> {
    const payment = await this.paymentModel.findOne({
      reference: data.reference,
    });

    if (!payment) {
      this.logger.warn(`Payment not found for reference: ${data.reference}`);
      return;
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      this.logger.warn(`Payment already processed: ${data.reference}`);
      return;
    }

    await this.paymentModel.findByIdAndUpdate(payment._id, {
      status: PaymentStatus.SUCCESS,
      channel: data.channel,
      rawPayload: data,
    });

    await this.updateOrderAfterPayment(payment.orderId, payment._id);

    this.logger.log(`Webhook processed - payment success: ${data.reference}`);
  }

  private async handleFailedCharge(data: any): Promise<void> {
    const payment = await this.paymentModel.findOne({
      reference: data.reference,
    });

    if (!payment) {
      this.logger.warn(`Payment not found for reference: ${data.reference}`);
      return;
    }

    await this.paymentModel.findByIdAndUpdate(payment._id, {
      status: PaymentStatus.FAILED,
      rawPayload: data,
    });

    this.logger.log(`Webhook processed - payment failed: ${data.reference}`);
  }

  private async updateOrderAfterPayment(
    orderId: Types.ObjectId,
    paymentId: Types.ObjectId,
  ): Promise<void> {
    await this.orderModel.findByIdAndUpdate(orderId, {
      status: OrderStatus.PAID,
      paymentId,
      paidAt: new Date(),
    });

    this.logger.log(`Order updated to PAID: ${orderId}`);
  }

  async getPaymentByReference(reference: string): Promise<Payment> {
    const payment = await this.paymentModel
      .findOne({ reference })
      .populate('orderId')
      .exec();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getPaymentsByOrder(orderId: string): Promise<Payment> {
    const p = await this.paymentModel
      .findOne({ orderId: new Types.ObjectId(orderId) })
      .exec();

    if (!p) throw new NotFoundException('Payment not found')

    return p
  }

  async getPaymentsByUser(
    user: JwtPayload,
    limit = 50,
    skip = 0,
  ): Promise<Payment[]> {
    const h = await this.paymentModel
      .find({ userId: new Types.ObjectId(user.auth_id) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('orderId')
      .exec();

    if (h && h.length <= 0) throw new NotFoundException('No payment history')

    return h
  }
}