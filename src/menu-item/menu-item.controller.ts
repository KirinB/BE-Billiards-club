import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MenuItemService } from './menu-item.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { FindMenuItemsQueryDto } from './dto/find-all-menu-item.dto';
import { responseMessage } from 'src/common/constants/response-messages';

@Controller('menu-item')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  // [POST] '/menu-item'
  @Post()
  async create(@Body() payload: CreateMenuItemDto) {
    const item = await this.menuItemService.create(payload);
    return {
      message: responseMessage.CREATE_SUCCESS,
      data: { item },
    };
  }

  // [GET] '/menu-item'
  @Get()
  async findAll(@Query() query: FindMenuItemsQueryDto) {
    const result = await this.menuItemService.findAll(query);
    return {
      message: responseMessage.GET_SUCCESS,
      data: result,
    };
  }

  //  [GET] '/menu-item/all'
  @Get('all')
  async findAllWithoutPagination() {
    const items = await this.menuItemService.findAllWithoutPagination();
    return {
      message: responseMessage.GET_SUCCESS,
      data: {
        items,
      },
    };
  }

  // [GET] '/menu-item/:id'
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.menuItemService.findOne(+id);
    return {
      message: responseMessage.GET_SUCCESS,
      data: { item },
    };
  }

  // [PATCH] '/menu-item/:id'
  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateMenuItemDto) {
    const item = await this.menuItemService.update(+id, payload);
    return {
      message: responseMessage.UPDATE_SUCCESS,
      data: { item },
    };
  }

  // [DELETE] '/menu-item/:id'
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.menuItemService.remove(+id);
    return {
      message: responseMessage.DELETE_SUCCESS,
    };
  }
}
