import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { VariantOptionsDto } from "src/product/dto";

export class UpdateCartItemDto {
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => VariantOptionsDto)
  variantOptions?: VariantOptionsDto;
}
