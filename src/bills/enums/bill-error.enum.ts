export enum BillError {
  // Validation errors
  TABLE_ID_EMPTY = 'Table ID is required',
  STAFF_ID_EMPTY = 'Staff ID is required',

  // Not found
  TABLE_NOT_FOUND = 'Table not found',
  SESSION_NOT_FOUND = 'Session not found',
  BILL_NOT_FOUND = 'Bill not found',
  BILL_ITEM_NOT_FOUND = 'Bill item not found',

  // Business logic errors
  SESSION_ALREADY_ENDED = 'Cannot create bill for a session that has ended',
  NO_ACTIVE_SESSION = 'No active session found for this table',
  NO_ORDERS_FOUND = 'No orders found in this session to create a bill',

  // Operation failures
  FAILED_TO_CREATE_BILL = 'Failed to create bill',
  FAILED_TO_UPDATE_BILL = 'Failed to update bill',
  FAILED_TO_DELETE_BILL = 'Failed to delete bill',
}
