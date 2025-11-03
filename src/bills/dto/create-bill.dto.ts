import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateBillDto {
  @IsInt()
  @IsNotEmpty()
  tableId: number;
}
