import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, IsBoolean } from 'class-validator';

export class FindMenuItemsQueryDto {
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
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  menuId?: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
