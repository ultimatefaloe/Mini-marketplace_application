import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class AdminSignUpDto extends SignUpDto {
  @IsOptional()
  permissions?: {
    manageProducts?: boolean;
    manageOrders?: boolean;
    managePayments?: boolean;
  };
}