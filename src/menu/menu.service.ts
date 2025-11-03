import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { FindMenusQueryDto } from './dto/find-all-menu.dto';
import { MenuError } from './enums/menu-errors.enum';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  // [POST] '/menu'
  async create(payload: CreateMenuDto) {
    const existingMenu = await this.prisma.menu.findUnique({
      where: { name: payload.name },
    });

    if (existingMenu)
      throw new ConflictException(MenuError.MENU_ALREADY_EXISTS);

    const newMenu = await this.prisma.menu.create({
      data: { name: payload.name },
    });

    if (!newMenu) throw new BadRequestException(MenuError.FAILED_TO_CREATE);

    return newMenu;
  }

  // [GET] '/menu'
  async findAll(query: FindMenusQueryDto) {
    const { name } = query;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;

    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (name) where.name = { contains: name };

    const total = await this.prisma.menu.count({ where });

    const menus = await this.prisma.menu.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { menuItems: true }, // lấy luôn MenuItem nếu muốn
    });

    return {
      menus,
      total,
      page,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    };
  }

  // [GET] '/menu/:id'
  async findOne(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: { menuItems: true },
    });

    if (!menu) throw new NotFoundException(MenuError.MENU_NOT_FOUND);

    return menu;
  }

  // [PATCH] '/menu/:id'
  async update(id: number, payload: UpdateMenuDto) {
    const { name } = payload;
    if (!name) throw new BadRequestException(MenuError.EMPTY_UPDATE_PAYLOAD);

    const menu = await this.findOne(id);

    if (menu.name === name)
      throw new BadRequestException(MenuError.MENU_NAME_UNCHANGED);

    const nameExists = await this.prisma.menu.findUnique({
      where: { name },
    });

    if (nameExists && nameExists.id !== id)
      throw new ConflictException(MenuError.MENU_ALREADY_EXISTS);

    const updated = await this.prisma.menu.update({
      where: { id },
      data: { name },
    });

    if (!updated) throw new BadRequestException(MenuError.FAILED_TO_UPDATE);

    return updated;
  }

  // [DELETE] '/menu/:id'
  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.menu.delete({ where: { id } });
  }
}
