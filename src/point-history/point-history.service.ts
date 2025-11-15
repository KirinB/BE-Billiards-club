import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePointHistoryDto } from './dto/create-point-history.dto';
import { UpdatePointHistoryDto } from './dto/update-point-history.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { memberLevelUp } from 'src/common/helpers/member-auto-level-up.helper';
import { FindAllPointHistory } from './dto/find-all-point-history.dto';

@Injectable()
export class PointHistoryService {
  constructor(private readonly prisma: PrismaService) {}
  async create(payload: CreatePointHistoryDto, staffId: number) {
    try {
      const { memberPhone, points, type, reason } = payload;
      const member = await this.prisma.member.findUnique({
        where: {
          phone: memberPhone,
          deleted: false,
        },
      });
      if (!member) throw new BadRequestException('Member not found');

      if (type === 'REDEEM' && Math.abs(points) > member.totalPoints) {
        throw new BadRequestException('Not enough points to redeem');
      }

      const pointHistory = await this.prisma.pointHistory.create({
        data: {
          points,
          memberId: member.id,
          type,
          staffId,
          reason,
        },
      });

      const updatedMember = await this.prisma.member.update({
        where: {
          id: member.id,
        },
        data: {
          totalPoints: {
            increment: points,
          },
        },
      });

      //Kiểm tra level member đã đủ up lên chưa
      const storeInfo = await this.prisma.storeInfo.findFirst();

      const newLevel = memberLevelUp(
        updatedMember.totalPoints,
        storeInfo!.levelConfig,
      );

      if (newLevel !== updatedMember.memberLevel) {
        await this.prisma.member.update({
          where: {
            id: member.id,
          },
          data: {
            memberLevel: newLevel,
          },
        });
      }

      return pointHistory;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findAll(query: FindAllPointHistory) {
    const { type, page = 1, pageSize = 10 } = query;
    const skip = (page - 1) * pageSize;

    // Build filter object
    const where: any = {};
    if (type && type !== 'ALL') where.type = type;

    // Count total records
    const total = await this.prisma.pointHistory.count({ where });

    // Fetch paginated point histories
    const pointHistories = await this.prisma.pointHistory.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        member: { select: { id: true, name: true, phone: true } },
        staff: { select: { id: true, name: true } },
      },
    });

    return {
      pointHistories,
      total,
      page,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number) {
    try {
      const pointHistory = await this.prisma.pointHistory.findUnique({
        where: {
          id,
        },
        include: {
          member: {
            select: {
              name: true,
              email: true,
              phone: true,
              totalPoints: true,
              memberLevel: true,
            },
          },
          staff: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!pointHistory) throw new NotFoundException('Not found Point History');

      return pointHistory;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: number, payload: UpdatePointHistoryDto) {
    const pointHistory = await this.findOne(id);

    const updatedPointHistory = await this.prisma.pointHistory.update({
      where: {
        id: pointHistory.id,
      },
      data: {
        ...payload,
      },
    });

    const updatedMember = await this.prisma.member.update({
      where: {
        id: updatedPointHistory.memberId,
      },
      data: {
        totalPoints: {
          increment: updatedPointHistory.points,
        },
      },
    });

    const storeInfo = await this.prisma.storeInfo.findFirst();

    const newLevel = memberLevelUp(
      updatedMember.totalPoints,
      storeInfo!.levelConfig,
    );

    if (newLevel !== updatedMember.memberLevel) {
      await this.prisma.member.update({
        where: {
          id: updatedMember.id,
        },
        data: {
          memberLevel: newLevel,
        },
      });
    }

    return { ...updatedPointHistory };
  }

  async remove(id: number) {
    await this.prisma.$transaction(async (prisma) => {
      const pointHistory = await prisma.pointHistory.findUnique({
        where: { id },
      });

      if (!pointHistory) throw new NotFoundException('Point history not found');

      // Trừ điểm member
      const member = await prisma.member.update({
        where: { id: pointHistory.memberId },
        data: { totalPoints: { decrement: pointHistory.points } },
      });

      // Cập nhật level member
      const storeInfo = await prisma.storeInfo.findFirst();
      const newLevel = memberLevelUp(
        member.totalPoints,
        storeInfo!.levelConfig,
      );
      if (newLevel !== member.memberLevel) {
        await prisma.member.update({
          where: { id: member.id },
          data: { memberLevel: newLevel },
        });
      }

      // Xóa point history
      await prisma.pointHistory.delete({ where: { id } });
    });
  }
}
