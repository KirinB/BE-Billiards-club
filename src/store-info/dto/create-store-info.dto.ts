import { IsInt, IsString } from 'class-validator';

export class CreateStoreInfoDto {
  @IsString()
  name: string;
  @IsString()
  address: string;
  @IsString()
  phone: string;
  @IsString()
  logo: string;
  @IsInt()
  vat: number;
}
