import { IsOptional, IsString, IsEnum, IsMongoId } from 'class-validator';

export class CancelOrderDto {
  @IsOptional()
  @IsString()
  reason?: string;
}