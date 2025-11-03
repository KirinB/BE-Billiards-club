import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { responseMessage } from 'src/common/constants/response-messages';
import { Request } from 'express';
import { IAuthUser } from 'src/common/interfaces/auth-user.interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  //  [POST] '/orders/'
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const user = req.user as IAuthUser;

    const order = await this.ordersService.create(createOrderDto, user.id);

    return {
      message: responseMessage.CREATE_SUCCESS,
      data: {
        order,
      },
    };
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  // [GET] `/orrders/:id`
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findOne(+id);
    return {
      message: responseMessage.GET_SUCCESS,
      data: {
        order,
      },
    };
  }

  // [PATCH] '/orders/:id'
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const result = await this.ordersService.update(+id, updateOrderDto);

    return {
      message: responseMessage.UPDATE_SUCCESS,
      data: {
        order: result,
      },
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
