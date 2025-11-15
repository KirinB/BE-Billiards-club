import { PointType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePointHistoryDto {
  @IsString()
  memberPhone: string;

  @IsEnum(PointType)
  type: PointType;

  @IsInt()
  points: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
