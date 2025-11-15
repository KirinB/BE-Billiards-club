import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum PointType {
  EARN = 'EARN',
  REDEEM = 'REDEEM',
  ADJUST = 'ADJUST',
  ALL = 'ALL',
}

export class FindAllPointHistory {
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

  @IsOptional()
  @IsEnum(PointType)
  type?: PointType;
}
