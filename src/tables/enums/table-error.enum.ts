export enum TableError {
  NAME_EMPTY = 'Table name is empty',
  TYPE_EMPTY = 'Table type is empty',
  TYPE_INVALID = 'Table type is invalid',
  PRICE_PER_HOUR_EMPTY = 'Price per hour is empty',
  PRICE_PER_HOUR_INVALID = 'Price per hour must be a positive number',
  STATUS_INVALID = 'Table status is invalid',
  TABLE_NOT_FOUND = 'Table not found',
  TABLE_ALREADY_RESERVED = 'Table is already reserved',
  TABLE_ALREADY_PLAYING = 'Table is currently in play',
}
