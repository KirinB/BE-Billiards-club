import { IsOptional, IsIn, IsDateString } from 'class-validator';

export class FindChartQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(['day', 'month'])
  interval?: 'day' | 'month' = 'day';
}
