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

  @IsOptional()
  @IsUrl({ require_tld: false })
  callbackUrl?: string;
}


export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  reference: string;
}