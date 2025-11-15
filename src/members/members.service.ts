import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryFindAllMember } from './dto/find-all-member.dto';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(payload: CreateMemberDto) {
    try {
      const { name, phone, email } = payload;

      const memberExist = await this.prisma.member.findUnique({
        where: {
          phone,
        },
      });

      if (memberExist && !memberExist.deleted)
        throw new BadRequestException(
          'Đã tồn tại người dùng với số điện thoại này',
        );

      if (memberExist && memberExist.deleted)
        throw new BadRequestException('Bạn muốn mở lại người dùng');

      const newMember = await this.prisma.member.create({
        data: {
          name,
          phone,
          email: email ?? null,
        },
      });
      return newMember;
    } catch (error) {
      console.log('Lỗi từ create member:', error);
      throw error;
    }
  }

  async findAll(query: QueryFindAllMember) {
    try {
      const { name } = query;
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 10;

      const skip = (page - 1) * pageSize;

      const where: any = { deleted: false };
      if (name) where.name = { contains: name };

      const [total, members] = await this.prisma.$transaction([
        this.prisma.member.count({ where }),
        this.prisma.member.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
      ]);
      return {
        members,
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

  async findOne(id: number) {
    try {
      const member = await this.prisma.member.findUnique({
        where: {
          id,
          deleted: false,
        },
      });

      if (!member) throw new NotFoundException('Không tồn tại người dùng');

      return member;
    } catch (error) {
      console.log('Lỗi ở findOne', error);
      throw error;
    }
  }

  async update(id: number, updateMemberDto: UpdateMemberDto) {
    const member = await this.findOne(id);
    const updatedMember = await this.prisma.member.update({
      where: {
        id: member.id,
      },
      data: {
        ...updateMemberDto,
      },
    });
    return updatedMember;
  }

  async remove(id: number) {
    try {
      const member = await this.findOne(id);

      await this.prisma.member.update({
        where: {
          id: member.id,
        },
        data: {
          deleted: true,
        },
      });

      return `This action removes a #${id} member`;
    } catch (error) {
      console.log('Lỗi ở remove member', error);
      throw error;
    }
  }
}
