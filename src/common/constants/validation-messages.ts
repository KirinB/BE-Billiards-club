export const ValidationMessages = {
  USERNAME_REQUIRED: 'Username is required',
  USERNAME_STRING: 'Username must be a string',
  USERNAME_MIN: 'Username must be at least 3 characters',
  USERNAME_MAX: 'Username cannot exceed 20 characters',
  USERNAME_INVALID: 'Username can only contain letters, numbers, ., _, or -',
  USERNAME_TAKEN: 'This username is already taken',

  NAME_REQUIRED: 'Full name is required',
  NAME_STRING: 'Full name must be a string',
  NAME_MIN: 'Full name must be at least 2 characters',
  NAME_MAX: 'Full name cannot exceed 50 characters',

  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Email must be a valid email address',
  EMAIL_TAKEN: 'This email is already registered',

  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MIN: 'Password must be at least 6 characters',

  ROLE_INVALID: 'Role must be either ADMIN or STAFF',
};
