import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderError } from './enums/order-errors.enum';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(payload: CreateOrderDto, staffId: number) {
    const { items, tableId } = payload;

    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
      include: {
        currentSession: true,
      },
    });

    if (!table) throw new NotFoundException(OrderError.TABLE_NOT_FOUND);

    if (!table.currentSession || !table.currentSessionId)
      throw new NotFoundException(OrderError.SESSION_NOT_FOUND);

    const sessionId = table.currentSessionId;

    await Promise.all(
      items.map(async (item) => {
        const menuItem = await this.prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
        });
        if (!menuItem)
          throw new NotFoundException(OrderError.MENU_ITEM_NOT_FOUND);
        if (item.quantity <= 0)
          throw new BadRequestException(
            `${menuItem.name} quantity must be greater than 0`,
          );
      }),
    );

    const order = await this.prisma.$transaction(async (prisma) => {
      const newOrder = await prisma.order.create({
        data: {
          sessionId,
          createdById: staffId,
        },
      });

      const orderItemsData = items.map((item) => ({
        orderId: newOrder.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      }));

      await prisma.orderItem.createMany({
        data: orderItemsData,
      });

      return newOrder;
    });

    return order;
  }

  findAll() {
    return `This action returns all orders`;
  }

  // [GET]   '/orders/:id'
  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) throw new NotFoundException(OrderError.ORDER_NOT_FOUND);

    return order;
  }

  //  [PATCH] '/orders/:id'
  async update(id: number, payload: UpdateOrderDto) {
    // const { items, tableId } = payload;
    // const order = await this.findOne(id);

    // const table = await this.prisma.table.findUnique({
    //   where: { id: tableId },
    //   include: {
    //     currentSession: true,
    //   },
    // });

    // if (!table) throw new NotFoundException(OrderError.TABLE_NOT_FOUND);

    // if (!table.currentSession || !table.currentSessionId)
    //   throw new BadRequestException(OrderError.SESSION_NOT_FOUND);

    // const sessionId = table.currentSessionId;

    // if (items !== undefined) {
    //   await Promise.all(
    //     items.map(async (item) => {
    //       const menuItem = await this.prisma.menuItem.findUnique({
    //         where: { id: item.menuItemId },
    //       });
    //       if (!menuItem)
    //         throw new NotFoundException(OrderError.MENU_ITEM_NOT_FOUND);
    //       if (item.quantity <= 0)
    //         throw new BadRequestException(
    //           `${menuItem.name} quantity must be greater than 0`,
    //         );
    //     }),
    //   );
    // }

    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
