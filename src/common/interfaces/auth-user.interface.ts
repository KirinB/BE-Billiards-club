import { Role } from '@prisma/client';

export interface IAuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  username: string;
}
