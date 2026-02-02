import {
  IsArray,
  IsNotEmpty,
  ValidateNested,
  IsMongoId,
  IsNumber,
  Min,
  IsString,
  IsOptional,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryMethod } from 'src/models/order.schema';

export class OrderItemDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;
}

export class CreateOrderDto {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsEnum(DeliveryMethod)
  @IsNotEmpty()
  deliveryMethod: DeliveryMethod;

  @IsOptional()
  @IsString()
  addressId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}