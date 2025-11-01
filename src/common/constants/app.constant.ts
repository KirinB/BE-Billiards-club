import 'dotenv/config';
import { parseJwtExp } from '../helpers/ulti.helper';

export const NODE_ENV = process.env.NODE_ENV || 'development';

// JWT
export const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || 'defaultAccessSecret';
export const ACCESS_TOKEN_EXPIRED = process.env.ACCESS_TOKEN_EXPIRED || '15m';

export const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'defaultRefreshSecret';
export const REFRESH_TOKEN_EXPIRED: string =
  process.env.REFRESH_TOKEN_EXPIRED ?? '7d';

export const REFRESH_TOKEN_MAXAGE: number = (() => {
  try {
    return parseJwtExp(process.env.REFRESH_TOKEN_EXPIRED ?? '7d');
  } catch {
    return 7 * 24 * 60 * 60 * 1000;
  }
})();

// Mail configuration
export const MAIL_HOST = process.env.MAIL_HOST || 'smtp.gmail.com';
export const MAIL_PORT = Number(process.env.MAIL_PORT) || 465;
export const MAIL_SECURE = process.env.MAIL_SECURE === 'true';
export const MAIL_USER = process.env.MAIL_USER || '';
export const MAIL_PASS = process.env.MAIL_PASS || '';
export const MAIL_FROM = process.env.MAIL_FROM || MAIL_USER;

// Frontend URL
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Reset token expiry (phút)
export const RESET_TOKEN_EXPIRY_MINUTES =
  Number(process.env.RESET_TOKEN_EXPIRY_MINUTES) || 15;

export const RESET_TOKEN_MAXAGE: number = (() => {
  try {
    return parseJwtExp(`${RESET_TOKEN_EXPIRY_MINUTES}m`);
  } catch {
    // fallback 15 phút
    return 15 * 60 * 1000;
  }
})();
// Dev/test mode override email recipient
export const TEST_RECEIVER_EMAIL = NODE_ENV === 'dev' ? MAIL_USER : undefined;
