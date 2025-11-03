export enum CategoryError {
  // Validation
  NAME_EMPTY = 'Category name is required',
  EMPTY_UPDATE_PAYLOAD = 'No data provided for update',
  CATEGORY_NAME_UNCHANGED = 'Category name is unchanged',

  // Not found
  CATEGORY_NOT_FOUND = 'Category not found',

  // Business logic
  CATEGORY_ALREADY_EXISTS = 'Category name already exists',

  // Operation failures
  FAILED_TO_CREATE = 'Failed to create category',
  FAILED_TO_UPDATE = 'Failed to update category',
  FAILED_TO_DELETE = 'Failed to delete category',
}
