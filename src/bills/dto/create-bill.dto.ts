import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBillDto {
  @IsInt()
  @IsNotEmpty()
  tableId: number;

  @IsString()
  @IsOptional()
  phone?: string;
}
