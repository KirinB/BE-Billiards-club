import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindSessionsQueryDto } from './dto/find-all-session.dto';
import { contains } from 'class-validator';
import { SessionError } from './enums/session-error.enum';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ tableId }: CreateSessionDto, staffId: number) {
    try {
      const table = await this.prisma.table.findUnique({
        where: {
          id: tableId,
        },
      });

      if (!table) throw new NotFoundException(SessionError.TABLE_NOT_FOUND);

      if (table.status === 'PLAYING')
        throw new BadRequestException(SessionError.TABLE_PLAYING);

      const session = await this.prisma.session.create({
        data: {
          tableId,
          staffId,
        },
      });

      await this.prisma.table.update({
        where: {
          id: tableId,
        },
        data: {
          status: 'PLAYING',
          currentSessionId: session.id,
        },
      });

      return session;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(query: FindSessionsQueryDto) {
    const { staffId, staffName, tableId } = query;

    const page = query.page ?? 1;
    const pageSize = query.page ?? 10;

    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (tableId) where.tableId = Number(tableId);
    if (staffId) where.staffId = Number(staffId);
    if (staffName) {
      where.staff = {
        name: { contains: staffName },
      };
    }

    const total = await this.prisma.session.count({ where });

    const sessions = await this.prisma.session.findMany({
      where,
      include: {
        table: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        bill: {
          select: {
            id: true,
            totalAmount: true,
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      sessions,
      total,
      page,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    };
  }

  //  [GET] /session/:id
  async findOne(id: number) {
    const session = await this.prisma.session.findUnique({
      where: {
        id,
      },
      include: {
        table: true,
        staff: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        bill: true,
      },
    });

    if (!session) throw new NotFoundException(SessionError.SESSION_NOT_FOUND);

    return session;
  }

  //  [PATCH] '/session/:id'
  async endSession(id: number, payload: UpdateSessionDto) {
    const session = await this.prisma.session.findUnique({
      where: {
        id,
      },
      include: {
        table: true,
      },
    });

    if (!session) throw new NotFoundException(SessionError.SESSION_NOT_FOUND);

    if (session.endTime)
      throw new BadRequestException(SessionError.SESSION_ALREADY_ENDED);

    const endTime = new Date();
    const hoursPlayed =
      (endTime.getTime() - new Date(session.startTime).getTime()) /
      (1000 * 60 * 60);

    const totalAmount = Math.ceil(hoursPlayed * session.table.pricePerHour);

    const [updatedSession] = await this.prisma.$transaction([
      this.prisma.session.update({
        where: {
          id,
        },
        data: {
          endTime,
          totalAmount,
        },
      }),
      this.prisma.table.update({
        where: {
          id: session.tableId,
        },
        data: {
          status: 'AVAILABLE',
          currentSessionId: null,
        },
      }),
    ]);

    return updatedSession;
  }

  //  [DELETE] /sessions/:id
  async remove(id: number) {
    const session = await this.prisma.session.findUnique({
      where: { id },
    });

    if (!session) throw new NotFoundException(SessionError.SESSION_NOT_FOUND);

    await this.prisma.session.delete({
      where: {
        id,
      },
    });
  }
}
