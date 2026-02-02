import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/models/order.schema';
import { Product, ProductSchema } from 'src/models/product.shcema';
import { OrderController } from './orders.controller';
import { OrderService } from './orders.service';
import { Address, AddressSchema } from 'src/models/address.schema';
import { Vendor, VendorSchema } from 'src/models/vendor.schema';
import { AddressModule } from 'src/address/address.module';

@Module({
  imports: [
    AddressModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Address.name, schema: AddressSchema },
      { name: Vendor.name, schema: VendorSchema },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}