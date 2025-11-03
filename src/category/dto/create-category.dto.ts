import { IsNotEmpty, IsString } from 'class-validator';
import { CategoryError } from '../enums/category-error.enum';

export class CreateCategoryDto {
  @IsNotEmpty({ message: CategoryError.NAME_EMPTY })
  @IsString()
  name: string;
}
