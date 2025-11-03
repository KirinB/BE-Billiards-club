import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateSessionDto {
  @IsInt()
  @IsNotEmpty()
  tableId: number;
}
