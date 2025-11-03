import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { FindMenuItemsQueryDto } from './dto/find-all-menu-item.dto';
import { MenuItemError } from './enums/menu-item-errors.enum';

@Injectable()
export class MenuItemService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateMenuItemDto) {
    const { name, price, categoryId, menuIds, available } = payload;

    const exist = await this.prisma.menuItem.findFirst({ where: { name } });
    if (exist)
      throw new ConflictException(MenuItemError.MENU_ITEM_ALREADY_EXISTS);

    // Check menus exist
    const menus = await this.prisma.menu.findMany({
      where: { id: { in: menuIds } },
    });
    if (menus.length !== menuIds.length)
      throw new NotFoundException(MenuItemError.MENU_NOT_FOUND);

    // Check category
    if (categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category)
        throw new NotFoundException(MenuItemError.CATEGORY_NOT_FOUND);
    }

    const menuItem = await this.prisma.menuItem.create({
      data: {
        name,
        price,
        categoryId,
        available,
        menus: {
          create: menuIds.map((menuId) => ({ menuId })),
        },
      },
      include: {
        menus: { include: { menu: true } },
        category: true,
      },
    });

    return menuItem;
  }

  async findAll(query: FindMenuItemsQueryDto) {
    const {
      page = 1,
      pageSize = 10,
      name,
      categoryId,
      menuId,
      available,
    } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (name) where.name = { contains: name };
    if (categoryId) where.categoryId = categoryId;
    if (available !== undefined) where.available = available;
    if (menuId) where.menus = { some: { menuId } };

    const total = await this.prisma.menuItem.count({ where });

    const items = await this.prisma.menuItem.findMany({
      where,
      include: { menus: { include: { menu: true } }, category: true },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    return {
      items,
      total,
      page,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { menus: { include: { menu: true } }, category: true },
    });
    if (!item) throw new NotFoundException(MenuItemError.MENU_ITEM_NOT_FOUND);
    return item;
  }

  async update(id: number, payload: UpdateMenuItemDto) {
    const item = await this.findOne(id);
    const { name, price, categoryId, menuIds, available } = payload;

    if (categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category)
        throw new NotFoundException(MenuItemError.CATEGORY_NOT_FOUND);
    }

    if (menuIds) {
      const menus = await this.prisma.menu.findMany({
        where: { id: { in: menuIds } },
      });
      if (menus.length !== menuIds.length)
        throw new NotFoundException(MenuItemError.MENU_NOT_FOUND);
    }

    const updated = await this.prisma.$transaction([
      this.prisma.menuItem.update({
        where: { id },
        data: { name, price, categoryId, available },
      }),
      ...(menuIds
        ? [
            this.prisma.menuItemOnMenu.deleteMany({
              where: { menuItemId: id },
            }),
            this.prisma.menuItemOnMenu.createMany({
              data: menuIds.map((menuId) => ({ menuItemId: id, menuId })),
            }),
          ]
        : []),
    ]);

    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.menuItem.delete({ where: { id } });
  }
}
