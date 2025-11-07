// src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindSummaryQueryDto } from './dto/find-summary-query.dto';
import { FindChartQueryDto } from './dto/find-chart-query.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(query: FindSummaryQueryDto) {
    const { startDate, endDate } = query;

    const whereDate =
      startDate || endDate
        ? {
            createdAt: {
              gte: startDate ? new Date(startDate) : undefined,
              lte: endDate ? new Date(endDate) : undefined,
            },
          }
        : {};

    // 1️⃣ Tổng doanh thu
    const totalRevenueAggregate = await this.prisma.bill.aggregate({
      _sum: { totalAmount: true },
      where: whereDate,
    });
    const totalRevenue = totalRevenueAggregate._sum.totalAmount ?? 0;

    // 2️⃣ Tổng số session
    const totalSessions = await this.prisma.session.count({
      where: {
        ...whereDate,
        endTime: { not: null }, // chỉ tính session đã kết thúc
      },
    });

    // 3️⃣ Tổng số orders
    const totalOrders = await this.prisma.order.count({
      where: whereDate,
    });

    // 4️⃣ Bàn đang chơi & trống
    const tablesPlaying = await this.prisma.table.count({
      where: { status: 'PLAYING' },
    });

    const tablesAvailable = await this.prisma.table.count({
      where: { status: 'AVAILABLE' },
    });

    // 5️⃣ Top 5 món bán chạy (theo quantity)
    const topMenuItems = await this.prisma.billItem.groupBy({
      by: ['menuItemId'],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    // Lấy thông tin tên món
    const menuItemIds = topMenuItems.map((item) => item.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    const topMenuItemsFormatted = topMenuItems.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      return {
        id: item.menuItemId,
        name: menuItem?.name ?? 'Unknown',
        totalQuantity: item._sum.quantity,
        totalRevenue: item._sum.price,
      };
    });

    return {
      totalRevenue,
      totalSessions,
      totalOrders,
      tablesPlaying,
      tablesAvailable,
      topMenuItems: topMenuItemsFormatted,
    };
  }
  async getChart(query: FindChartQueryDto) {
    const { startDate, endDate, interval = 'day' } = query;

    const whereDate: any = {};
    if (startDate) whereDate.gte = new Date(startDate);
    if (endDate) whereDate.lte = new Date(endDate);

    // 1️⃣ Lấy tất cả bill theo ngày hoặc tháng
    const bills = await this.prisma.bill.findMany({
      where: startDate || endDate ? { createdAt: whereDate } : {},
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // 2️⃣ Gom nhóm theo day hoặc month
    const chartData: Record<string, number> = {};

    bills.forEach((bill) => {
      const date = new Date(bill.createdAt);
      let key: string;

      if (interval === 'day') {
        key = date.toISOString().split('T')[0]; // yyyy-mm-dd
      } else {
        key = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`; // yyyy-mm
      }

      if (!chartData[key]) chartData[key] = 0;
      chartData[key] += bill.totalAmount;
    });

    // 3️⃣ Trả về dạng mảng sorted
    const sortedKeys = Object.keys(chartData).sort();
    const data = sortedKeys.map((key) => ({
      date: key,
      revenue: chartData[key],
    }));

    return data;
  }
}
