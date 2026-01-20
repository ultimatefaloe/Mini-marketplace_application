import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsMongoId,
} from 'class-validator';

export class InitializePaymentDto {
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @IsUrl()
  @IsOptional()
  callbackUrl?: string;
}

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  reference: string;
}