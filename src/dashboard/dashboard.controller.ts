// src/dashboard/dashboard.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { FindSummaryQueryDto } from './dto/find-summary-query.dto';
import { responseMessage } from 'src/common/constants/response-messages';
import { FindChartQueryDto } from './dto/find-chart-query.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(@Query() query: FindSummaryQueryDto) {
    const data = await this.dashboardService.getSummary(query);

    return {
      message: responseMessage.GET_SUCCESS,
      data,
    };
  }

  @Get('chart')
  async getChart(@Query() query: FindChartQueryDto) {
    const data = await this.dashboardService.getChart(query);
    return {
      message: responseMessage.GET_SUCCESS,
      data,
    };
  }
}
