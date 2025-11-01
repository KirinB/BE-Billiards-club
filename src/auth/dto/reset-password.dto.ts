import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ValidationMessages } from 'src/common/constants/validation-messages';
import { AuthError } from '../enums/auth-error.enum';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty({ message: AuthError.PASSWORD_EMPTY })
  @IsString({ message: ValidationMessages.PASSWORD_REQUIRED })
  @MinLength(6, { message: ValidationMessages.PASSWORD_MIN })
  password: string;
}
