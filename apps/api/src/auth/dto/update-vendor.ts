import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { AccountStatus } from 'src/models/vendor.schema';
import { CreateVendorDto } from './create-vendor.dto';

export class UpdateVendorDto extends PartialType(CreateVendorDto) {
  @IsOptional()
  @IsEnum(AccountStatus)
  accountStatus?: AccountStatus;
}