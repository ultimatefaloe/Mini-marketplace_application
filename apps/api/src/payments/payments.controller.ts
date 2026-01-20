import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common';

import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  InitializePaymentDto,
  VerifyPaymentDto,
} from './dto/payment.dto';
import { PaymentService } from './payments.service';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) { }

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async initializePayment(
    @Body() dto: InitializePaymentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    this.logger.log(
      `Initializing payment for order ${dto.orderId} by user ${user.auth_id}`,
    );

    return await this.paymentService.initializePayment(
      dto.orderId,
      user,
      dto.callbackUrl,
    );
  }

  @Get('verify/:reference')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(@Param() dto: VerifyPaymentDto) {
    this.logger.log(`Verifying payment: ${dto.reference}`);

    const payment = await this.paymentService.verifyPayment(dto.reference);

    return {
      success: true,
      message:
        payment.status === 'SUCCESS'
          ? 'Payment verified successfully'
          : 'Payment verification failed',
      data: {
        reference: payment.reference,
        status: payment.status,
        amount: payment.amount,
        orderId: payment.orderId,
        paidAt: payment.rawPayload?.paid_at,
      },
    };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    this.logger.log('Webhook received from Paystack');

    if (!signature) {
      this.logger.warn('Webhook signature missing');
      return { success: false };
    }

    const payload = req.body;

    await this.paymentService.handleWebhook(payload, signature);

    return { success: true };
  }

  @Get('reference/:reference')
  @UseGuards(JwtAuthGuard)
  async getPaymentByReference(@Param('reference') reference: string) {
    return await this.paymentService.getPaymentByReference(reference);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  async getPaymentsByOrder(@Param('orderId') orderId: string) {
    return await this.paymentService.getPaymentsByOrder(orderId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getPaymentHistory(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    return await this.paymentService.getPaymentsByUser(
      user,
      limit,
      skip,
    );
  }
}