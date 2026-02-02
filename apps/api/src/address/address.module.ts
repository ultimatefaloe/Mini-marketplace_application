import { Logger, Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Address, AddressSchema } from 'src/models/address.schema';
import { AuthModule } from 'src/auth/auth.module';
import { Cart, CartSchema } from 'src/models/cart.schema';
import { Vendor, VendorSchema } from 'src/models/vendor.schema';
import { OpencageProvider } from 'src/providers/opencage.provider';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: Address.name, schema: AddressSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Vendor.name, schema: VendorSchema },
    ]),
  ],
  controllers: [AddressController],
  providers: [AddressService, Logger, OpencageProvider],
  exports: [AddressService, Logger]
})

export class AddressModule { }