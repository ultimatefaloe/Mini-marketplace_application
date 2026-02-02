import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { AddressService } from './address.service';
import { JwtAuthGuard } from 'src/auth/guards';
import { CreateAddressDto, UpdateAddressDto } from './dto';

@Controller('address')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
  ) { }


  @Post()
  createAddress(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAddressDto

  ) {
    return this.addressService.create(user, dto)
  }

  @Patch(':addressId')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('addressId') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(addressId, user, dto)
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
  ) {
    return this.addressService.findAll(user)
  }

  @Get(':addressId')
  fineOne(
    @Param('addressId') addressId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.addressService.findOne(addressId, user)
  }

  @Delete(':addressId')
  delete(
    @Param('addressId') addressId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.addressService.delete(addressId, user)
  }

  @Get('calculate/:addressId')
  @HttpCode(200)
  calculateOrder(
    @Param('addressId') addressId: string,
    @CurrentUser() user: JwtPayload
  ) {
    const data = this.addressService.calculateDeliveryFee(addressId, user);
    return {
      success: true,
      message: 'success',
      data
    }
  }
}
