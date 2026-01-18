import { Type } from 'class-transformer';
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class Payload {
  @ApiProperty({ example: 'ultimatefaloe@gmail.com', description: "receipient email" })
  @IsString()
  @IsNotEmpty()
  to: string

  @ApiProperty({ example: 'Login email notification', description: "You just Login" })
  @IsString()
  @IsNotEmpty()
  subject: string

  @ApiProperty({ example: '<h1>EMail has been sent<h1/>', description: "Email template" })
  @IsString()
  @IsNotEmpty()
  html: string
}

export class BulkPayload {

  @ApiProperty({ example: [{ to: 'to', subject: 'subject', html: "temlate" }], description: 'Array of recipients' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Payload)
  payload: Payload
}