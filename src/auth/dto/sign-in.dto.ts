import { IsNotEmpty, IsString } from 'class-validator';
import { AuthError } from '../enums/auth-error.enum';

export class SignInDto {
  @IsNotEmpty({ message: AuthError.EMAIL_OR_USERNAME_EMPTY })
  @IsString()
  usernameOrEmail: string;

  @IsNotEmpty({ message: AuthError.PASSWORD_EMPTY })
  @IsString()
  password: string;
}
