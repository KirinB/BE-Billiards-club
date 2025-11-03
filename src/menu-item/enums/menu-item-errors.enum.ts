export enum MenuItemError {
  // Validation
  NAME_EMPTY = 'Menu item name is required',
  PRICE_INVALID = 'Price must be a positive number',
  MENU_IDS_EMPTY = 'At least one menu must be selected',

  // Not found
  MENU_ITEM_NOT_FOUND = 'Menu item not found',
  CATEGORY_NOT_FOUND = 'Category not found',
  MENU_NOT_FOUND = 'Menu not found',

  // Business logic
  MENU_ITEM_ALREADY_EXISTS = 'Menu item with this name already exists',

  // Operation failures
  FAILED_TO_CREATE = 'Failed to create menu item',
  FAILED_TO_UPDATE = 'Failed to update menu item',
  FAILED_TO_DELETE = 'Failed to delete menu item',
}
