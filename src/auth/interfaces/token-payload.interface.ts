import { IAuthUser } from 'src/common/interfaces/auth-user.interface';

export interface TokenPayload {
  user: IAuthUser;
}
