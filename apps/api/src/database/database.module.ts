import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from 'src/models/cart.schema';
import { Category, CategorySchema } from 'src/models/category.schma';
import { Order, OrderSchema } from 'src/models/order.schema';
import { Payment, PaymentSchema } from 'src/models/payment.schema';
import { Product, ProductSchema } from 'src/models/product.shcema';
import { User, UserSchema } from 'src/models/user.schema';


@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
