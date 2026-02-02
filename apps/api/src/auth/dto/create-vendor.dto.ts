import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  MinLength, 
  IsOptional, 
  IsNumber, 
  ValidateNested,
  IsUrl,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';

export class VendorLocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class CreateVendorDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  businessLogo?: string;

  @IsOptional()
  @IsString()
  idDocument?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @ValidateNested()
  @Type(() => VendorLocationDto)
  location: VendorLocationDto;
}