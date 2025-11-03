import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsBoolean,
  IsOptional,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MenuItemError } from '../enums/menu-item-errors.enum';

export class CreateMenuItemDto {
  @IsNotEmpty({ message: MenuItemError.NAME_EMPTY })
  @IsString()
  name: string;

  @IsNumber()
  @Min(0, { message: MenuItemError.PRICE_INVALID })
  @Type(() => Number)
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @IsBoolean()
  @IsOptional()
  available?: boolean = true;

  @ArrayNotEmpty({ message: MenuItemError.MENU_IDS_EMPTY })
  @ArrayUnique()
  @Type(() => Number)
  menuIds: number[];
}
