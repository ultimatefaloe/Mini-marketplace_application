import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from 'src/models/order.schema';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}