import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FindSessionsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  tableId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  staffId?: number;

  @IsOptional()
  @IsString()
  staffName?: string;
}
