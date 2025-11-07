import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class FindBillsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sessionId?: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  staffId?: number;
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
}
