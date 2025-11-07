import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessionsService } from 'src/sessions/sessions.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { BillError } from './enums/bill-error.enum';
import { FindBillsQueryDto } from './dto/find-all-bill.dto';

@Injectable()
export class BillsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionsService,
  ) {}

  async create(payload: CreateBillDto, staffId: number) {
    const { tableId } = payload;

    // 1. Lấy bàn và session hiện tại
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
      include: { currentSession: true },
    });

    if (!table) throw new NotFoundException(BillError.TABLE_NOT_FOUND);

    if (!table.currentSession || !table.currentSessionId)
      throw new BadRequestException(BillError.NO_ACTIVE_SESSION);

    const sessionId = table.currentSessionId;

    // 2. Transaction: kết thúc session + tạo bill + update table
    const bill = await this.prisma.$transaction(async (prisma) => {
      // a. Lấy session
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          orders: { include: { orderItems: { include: { menuItem: true } } } },
        },
      });

      if (!session) throw new NotFoundException(BillError.SESSION_NOT_FOUND);
      if (session.endTime)
        throw new BadRequestException(BillError.SESSION_ALREADY_ENDED);

      // b. Tính giờ chơi
      const now = new Date();
      const hoursPlayed =
        (now.getTime() - new Date(session.startTime).getTime()) /
        (1000 * 60 * 60);
      const sessionAmount = Math.ceil(hoursPlayed * table.pricePerHour);

      // c. Tính tổng tiền đồ ăn
      const totalOrder = session.orders.reduce((accOrder, order) => {
        const orderTotal = order.orderItems.reduce(
          (accItem, item) => accItem + item.quantity * item.menuItem.price,
          0,
        );
        return accOrder + orderTotal;
      }, 0);

      // if (session.orders.length === 0)
      //   throw new BadRequestException(BillError.NO_ORDERS_FOUND);

      const totalAmount = sessionAmount + totalOrder;

      // d. Cập nhật session (endTime + totalAmount)
      await prisma.session.update({
        where: { id: session.id },
        data: { endTime: now, totalAmount },
      });

      // e. Tạo bill cùng bill items
      const newBill = await prisma.bill.create({
        data: {
          sessionId: session.id,
          createdById: staffId,
          totalAmount,
          items: {
            create: session.orders.flatMap((order) =>
              order.orderItems.map((item) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: item.menuItem.price,
              })),
            ),
          },
        },
        include: { items: true },
      });

      // f. Update trạng thái bàn
      await prisma.table.update({
        where: { id: table.id },
        data: { status: 'AVAILABLE', currentSessionId: null },
      });

      return { ...newBill, hoursPlayed, sessionAmount, totalOrder };
    });

    return bill;
  }

  // [GET] /bills
  async findAll(query: FindBillsQueryDto) {
    const { sessionId, staffId, page = 1, pageSize = 10 } = query;
    const skip = (page - 1) * pageSize;

    // Build filter
    const where: any = {};
    if (sessionId) where.sessionId = sessionId;
    if (staffId) where.createdById = staffId;

    // Count total records
    const total = await this.prisma.bill.count({ where });

    // Fetch paginated bills with relations
    const bills = await this.prisma.bill.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            role: true,
            createdAt: true,
          },
        }, // lấy thông tin nhân viên tạo bill
      },
    });

    return {
      bills,
      total,
      page,
      pageSize,
      totalPage: Math.ceil(total / pageSize),
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} bill`;
  }

  update(id: number, updateBillDto: UpdateBillDto) {
    return `This action updates a #${id} bill`;
  }

  remove(id: number) {
    return `This action removes a #${id} bill`;
  }
}
