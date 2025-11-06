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
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { FindMenusQueryDto } from './dto/find-all-menu.dto';
import { responseMessage } from 'src/common/constants/response-messages';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // [POST] '/menu'
  @Post()
  async create(@Body() payload: CreateMenuDto) {
    const menu = await this.menuService.create(payload);
    return {
      message: responseMessage.CREATE_SUCCESS,
      data: { menu },
    };
  }

  // [GET] '/menu'
  @Get()
  async findAll(@Query() query: FindMenusQueryDto) {
    const result = await this.menuService.findAll(query);
    return {
      message: responseMessage.GET_SUCCESS,
      data: result,
    };
  }

  //  [GET] '/menu/all',
  @Get('all')
  async findAllWithoutPagination() {
    const menus = await this.menuService.findAllWithoutPagination();

    return {
      message: responseMessage.GET_SUCCESS,
      data: {
        menus,
      },
    };
  }

  // [GET] '/menu/:id'
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const menu = await this.menuService.findOne(+id);
    return {
      message: responseMessage.GET_SUCCESS,
      data: { menu },
    };
  }

  // [PATCH] '/menu/:id'
  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateMenuDto) {
    const menu = await this.menuService.update(+id, payload);
    return {
      message: responseMessage.UPDATE_SUCCESS,
      data: { menu },
    };
  }

  // [DELETE] '/menu/:id'
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.menuService.remove(+id);
    return {
      message: responseMessage.DELETE_SUCCESS,
    };
  }
}
