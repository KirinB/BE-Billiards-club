import { Type } from 'class-transformer';
import { IsOptional, IsDateString } from 'class-validator';

export class FindSummaryQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
