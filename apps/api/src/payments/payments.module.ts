import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Payment, PaymentSchema } from 'src/models/payment.schema';
import { Order, OrderSchema } from 'src/models/order.schema';
import { PaymentController } from './payments.controller';
import { PaymentService } from './payments.service';
import { TokenBlacklistService } from 'src/auth/tokenBlackList.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, TokenBlacklistService],
  exports: [PaymentService],
})
export class PaymentModule {}