import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TableType } from '@prisma/client';
import { TableError } from './enums/table-error.enum';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  //  [POST] '/tables/'
  async create(payload: CreateTableDto) {
    const table = await this.prisma.table.create({
      data: {
        ...payload,
      },
    });
    return table;
  }

  //  [GET] '/tables/'

  async findAll(
    query: {
      page?: number;
      pageSize?: number;
      search?: string;
      priceSort?: 'asc' | 'desc';
      type?: TableType;
    } = {},
  ) {
    try {
      const {
        page = 1,
        pageSize = 10,
        search = '',
        priceSort = 'desc',
        type,
      } = query;
      const skip = (page - 1) * pageSize;

      // Build filter dynamically
      const where: any = {
        OR: [{ name: { contains: search } }],
      };

      if (type) {
        where.type = type;
      }

      const total = await this.prisma.table.count({ where });

      const tables = await this.prisma.table.findMany({
        where,
        orderBy: {
          pricePerHour: priceSort,
        },
        skip,
        take: pageSize,
      });

      return {
        tables,
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

  //  [GET] '/tables/all

  async findAllWithoutPagination() {
    try {
      const tables = await this.prisma.table.findMany({
        select: {
          id: true,
          name: true,
          createdAt: true,
          currentSession: {
            select: {
              id: true,
              tableId: true,
              startTime: true,
              endTime: true,
              createdAt: true,
              _count: {
                select: {
                  orders: true,
                },
              },
            },
          },
          status: true,
          pricePerHour: true,
          type: true,
        },
      });

      return tables;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  //  [GET] '/tables/:id'

  async findOne(id: number) {
    try {
      const table = await this.prisma.table.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          createdAt: true,
          currentSession: {
            select: {
              id: true,
              tableId: true,
              startTime: true,
              endTime: true,
              orders: {
                select: {
                  orderItems: {
                    select: {
                      menuItem: {
                        select: {
                          name: true,
                          price: true,
                        },
                      },
                    },
                  },
                },
              },
              createdAt: true,
            },
          },
          status: true,
          pricePerHour: true,
          type: true,
        },
      });

      if (!table) throw new NotFoundException(TableError.TABLE_NOT_FOUND);

      return table;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  //  [PATCH] '/tables/:id'

  async update(id: number, updateTableDto: UpdateTableDto) {
    try {
      // Kiểm tra xem bàn có tồn tại không
      const existingTable = await this.prisma.table.findUnique({
        where: { id },
      });

      if (!existingTable) {
        throw new NotFoundException(TableError.TABLE_NOT_FOUND);
      }

      // Cập nhật dữ liệu
      const updatedTable = await this.prisma.table.update({
        where: { id },
        data: updateTableDto,
      });

      return updatedTable;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  //  [DELETE] '/tables/:id'

  async remove(id: number) {
    try {
      await this.findOne(id);
      await this.prisma.table.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
