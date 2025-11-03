import { PartialType } from '@nestjs/mapped-types';
import { CreateTableDto } from './create-table.dto';
import { TableStatus, TableType } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTableDto extends PartialType(CreateTableDto) {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(TableType)
  @IsOptional()
  type?: TableType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  pricePerHour?: number;

  @IsEnum(TableStatus)
  @IsOptional()
  status?: TableStatus;
}
