import 'dotenv/config';
import { parseJwtExp } from '../helpers/ulti.helper';

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRED = process.env.ACCESS_TOKEN_EXPIRED;

export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const REFRESH_TOKEN_EXPIRED: string =
  process.env.REFRESH_TOKEN_EXPIRED ?? '7d';

export const REFRESH_TOKEN_MAXAGE: number = parseJwtExp(REFRESH_TOKEN_EXPIRED);
