import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product, ProductSchema } from 'src/models/product.shcema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule { }
