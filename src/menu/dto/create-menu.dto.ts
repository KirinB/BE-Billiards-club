import { IsNotEmpty, IsString } from 'class-validator';
import { MenuError } from '../enums/menu-errors.enum';

export class CreateMenuDto {
  @IsNotEmpty({ message: MenuError.NAME_EMPTY })
  @IsString()
  name: string;
}
