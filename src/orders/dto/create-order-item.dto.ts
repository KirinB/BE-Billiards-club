import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsInt({ message: 'Menu item ID must be an integer' })
  @IsNotEmpty()
  menuItemId: number;

  @IsInt({ message: 'Quantity must be an integer' })
  @IsNotEmpty()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}
