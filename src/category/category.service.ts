import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryError } from './enums/category-error.enum';
import { FindCategoriesQueryDto } from './dto/find-all-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: {
        name: payload.name,
      },
    });

    if (category)
      throw new ConflictException(CategoryError.CATEGORY_ALREADY_EXISTS);

    const newCategory = await this.prisma.category.create({
      data: {
        name: payload.name,
      },
    });

    return newCategory;
  }

  async findAll(query: FindCategoriesQueryDto) {
    try {
      const { name } = query;
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 10;

      const skip = (page - 1) * pageSize;

      const where: any = {};

      if (name) {
        where.name = {
          contains: name,
        };
      }

      const total = await this.prisma.category.count({ where });

      const categories = await this.prisma.category.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        categories,
        total,
        page,
        pageSize,
        totalPage: Math.ceil(total / pageSize),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  //  [GET] '/category/:id'
  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category)
      throw new NotFoundException(CategoryError.CATEGORY_NOT_FOUND);

    return category;
  }

  //[PATCH] '/category/:id'
  async update(id: number, payload: UpdateCategoryDto) {
    const { name } = payload;

    if (Object.keys(payload).length === 0) {
      throw new BadRequestException(CategoryError.EMPTY_UPDATE_PAYLOAD);
    }

    const category = await this.findOne(id);

    if (payload.name && payload.name === category.name) {
      throw new BadRequestException(CategoryError.CATEGORY_NAME_UNCHANGED);
    }

    const categoryUpdated = await this.prisma.category.update({
      where: {
        id: category.id,
      },
      data: {
        name,
      },
    });

    return categoryUpdated;
  }

  //  [DELETE] '/category/:id'
  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.category.delete({
      where: {
        id,
      },
    });
  }

  // [GET] '/category/all'
  async findAllWithoutPagination() {
    return await this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
