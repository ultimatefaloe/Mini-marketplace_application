import { IsOptional, IsString, IsBoolean, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCategoryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}