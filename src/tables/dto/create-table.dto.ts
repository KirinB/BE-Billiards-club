import { TableStatus, TableType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTableDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(TableType, { message: 'type must be either CAROM or POOL' })
  @IsNotEmpty()
  type: TableType;

  @IsNumber()
  @Min(0, { message: 'pricePerHour must be a positive number' })
  @IsNotEmpty()
  pricePerHour: number;

  @IsEnum(TableStatus, {
    message: 'status must be AVAILABLE, PLAYING or RESERVED',
  })
  @IsOptional()
  status?: TableStatus = TableStatus.AVAILABLE;
}
