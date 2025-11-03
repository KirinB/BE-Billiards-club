export enum OrderError {
  // Validation errors
  SESSION_ID_EMPTY = 'Session ID is required',
  MENU_ITEM_ID_EMPTY = 'Menu item ID is required',
  QUANTITY_INVALID = 'Quantity must be greater than 0',

  // Not found
  SESSION_NOT_FOUND = 'Session not found',
  TABLE_NOT_FOUND = 'Table not found',
  MENU_ITEM_NOT_FOUND = 'Menu item not found',
  ORDER_NOT_FOUND = 'Order not found',
  ORDER_ITEM_NOT_FOUND = 'Order item not found',

  // Business logic errors
  SESSION_ALREADY_ENDED = 'Cannot add order to a session that has ended',
  MENU_ITEM_NOT_AVAILABLE = 'Menu item is not available',

  // Operation failures
  FAILED_TO_CREATE_ORDER = 'Failed to create order',
  FAILED_TO_UPDATE_ORDER = 'Failed to update order',
  FAILED_TO_DELETE_ORDER = 'Failed to delete order',
}
