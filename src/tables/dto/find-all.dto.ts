import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TableType } from '@prisma/client';

export class FindTablesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'priceSort must be asc or desc' })
  priceSort?: 'asc' | 'desc';

  @IsOptional()
  @IsEnum(TableType, { message: 'Type must be POOL or CAROM' })
  type?: TableType;
}
