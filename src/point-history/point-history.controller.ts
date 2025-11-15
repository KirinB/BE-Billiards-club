import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { PointHistoryService } from './point-history.service';
import { CreatePointHistoryDto } from './dto/create-point-history.dto';
import { UpdatePointHistoryDto } from './dto/update-point-history.dto';
import { Request } from 'express';
import { IAuthUser } from 'src/common/interfaces/auth-user.interface';
import { FindAllPointHistory } from './dto/find-all-point-history.dto';
import { responseMessage } from 'src/common/constants/response-messages';

@Controller('point-history')
export class PointHistoryController {
  constructor(private readonly pointHistoryService: PointHistoryService) {}

  @Post()
  async create(@Body() payload: CreatePointHistoryDto, @Req() req: Request) {
    const user = req.user as IAuthUser;
    const pointHistory = await this.pointHistoryService.create(
      payload,
      user.id,
    );
    return {
      message: responseMessage.CREATE_SUCCESS,
      data: {
        pointHistory,
      },
    };
  }

  @Get()
  async findAll(@Query() query: FindAllPointHistory) {
    const data = await this.pointHistoryService.findAll(query);
    return {
      message: responseMessage.GET_SUCCESS,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const pointHistory = await this.pointHistoryService.findOne(+id);
    return {
      message: responseMessage.GET_SUCCESS,
      data: {
        pointHistory,
      },
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePointHistoryDto: UpdatePointHistoryDto,
  ) {
    const pointHistory = await this.pointHistoryService.update(
      +id,
      updatePointHistoryDto,
    );
    return {
      message: responseMessage.UPDATE_SUCCESS,
      data: {
        pointHistory,
      },
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.pointHistoryService.remove(+id);
    return {
      message: responseMessage.DELETE_SUCCESS,
    };
  }
}
