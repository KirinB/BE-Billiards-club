export enum SessionError {
  // Validation errors
  TABLE_ID_EMPTY = 'Table ID is required',
  STAFF_ID_EMPTY = 'Staff ID is required',

  // Not found
  TABLE_NOT_FOUND = 'Table not found',
  STAFF_NOT_FOUND = 'Staff not found',
  SESSION_NOT_FOUND = 'Session not found',

  // Business logic errors
  TABLE_PLAYING = 'Table is currently in play',
  SESSION_ALREADY_ACTIVE = 'A session is already active for this table',
  SESSION_ALREADY_ENDED = 'This session has already ended',

  // Invalid data
  INVALID_END_TIME = 'End time must be after start time',
  INVALID_TOTAL_AMOUNT = 'Total amount must be a positive number',

  // Operation failures
  FAILED_TO_CREATE = 'Failed to create session',
  FAILED_TO_UPDATE = 'Failed to update session',
  FAILED_TO_END = 'Failed to end session',
}
