import { IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  name?: string;
  @IsString()
  phone: string;
  @IsOptional()
  @IsString()
  email?: string;
}
