export enum AuthError {
  EMAIL_OR_USERNAME_EMPTY = 'Username or email is empty',
  PASSWORD_EMPTY = 'Password is empty',
  USER_NOT_FOUND = 'Invalid email, username, or password',
  TOKEN_MISSING = 'Access token is missing',
  TOKEN_INVALID = 'Access token is invalid',
  TOKEN_EXPIRED = 'Access token has expired',
  TOKEN_INVALID_OR_EXPIRED = 'Token is invalid or expired',
  REFRESH_TOKEN_MISSING = 'Refresh token missing',
  REFRESH_TOKEN_INVALID = 'Refresh token invalid',
}
