import { IsInt, IsOptional, IsString } from 'class-validator';

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
  @IsInt()
  pointRate: number;
  @IsOptional()
  levelConfig?: {
    BRONZE: number;
    SILVER: number;
    GOLD: number;
    DIAMOND: number;
  };
}
