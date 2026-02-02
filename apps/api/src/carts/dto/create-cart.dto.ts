import { Type } from "class-transformer";
import { ArrayMinSize, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { VariantOptionsDto } from 'src/product/dto';

export class CartItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsOptional()
  nameSnapshot?: string;

  @IsString()
  @IsOptional()
  productImage?: string;

  @IsNumber()
  @IsOptional()
  priceSnapshot?: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => VariantOptionsDto)
  variantOptions?: VariantOptionsDto;
}


export class CreateCartDto {

  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[]
}