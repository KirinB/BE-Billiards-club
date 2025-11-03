export enum MenuError {
  // Validation
  NAME_EMPTY = 'Menu name is required',
  EMPTY_UPDATE_PAYLOAD = 'No data provided for update',
  MENU_NAME_UNCHANGED = 'Menu name is unchanged',

  // Not found
  MENU_NOT_FOUND = 'Menu not found',

  // Business logic
  MENU_ALREADY_EXISTS = 'Menu name already exists',

  // Operation failures
  FAILED_TO_CREATE = 'Failed to create menu',
  FAILED_TO_UPDATE = 'Failed to update menu',
  FAILED_TO_DELETE = 'Failed to delete menu',
}
