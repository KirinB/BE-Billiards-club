import {
  IsString,
  IsEmail,
  IsEnum,
  MinLength,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';
import { Role } from '@prisma/client';
import { ValidationMessages } from 'src/common/constants/validation-messages';
import { Transform } from 'class-transformer';
export class CreateUserDto {
  @IsString({ message: ValidationMessages.USERNAME_REQUIRED })
  @MinLength(3, { message: ValidationMessages.USERNAME_MIN })
  @MaxLength(20, { message: ValidationMessages.USERNAME_MAX })
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message: ValidationMessages.USERNAME_INVALID,
  })
  @Transform(({ value }) => value?.trim())
  username: string;

  @IsString({ message: ValidationMessages.NAME_STRING })
  name: string;

  @IsEmail({}, { message: ValidationMessages.EMAIL_INVALID })
  email: string;

  @IsString({ message: ValidationMessages.PASSWORD_REQUIRED })
  //   @MinLength(6, { message: ValidationMessages.PASSWORD_MIN })
  password: string;

  @IsEnum(Role, { message: ValidationMessages.ROLE_INVALID })
  @IsOptional()
  role?: Role;
}
