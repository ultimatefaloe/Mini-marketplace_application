import { Type } from "class-transformer";
import { ArrayMinSize, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class CartItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string

  @IsString()
  @IsOptional()
  nameSnapshot?: string

  @IsString()
  @IsOptional()
  priceSnapshot?: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number

}

export class CreateCartDto {

  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[]
}