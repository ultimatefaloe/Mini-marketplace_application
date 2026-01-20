import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { Cart, CartSchema } from 'src/models/cart.schema';
import { Product, ProductSchema } from 'src/models/product.shcema';
import { TokenBlacklistService } from 'src/auth/tokenBlackList.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema }
    ])
  ],
  controllers: [CartsController],
  providers: [CartsService, TokenBlacklistService],
  exports: [CartsService]
})
export class CartsModule {}