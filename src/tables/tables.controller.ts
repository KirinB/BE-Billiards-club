import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { responseMessage } from 'src/common/constants/response-messages';
import { CreateTableDto } from './dto/create-table.dto';
import { FindTablesQueryDto } from './dto/find-all.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TablesService } from './tables.service';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  // [POST]  '/tables/'
  @Post()
  async create(@Body() createTableDto: CreateTableDto) {
    const table = await this.tablesService.create(createTableDto);
    return {
      message: responseMessage.CREATE_SUCCESS,
      data: {
        table,
      },
    };
  }

  // [GET] '/tables/'
  @Get()
  async findAll(@Query() query: FindTablesQueryDto) {
    const data = await this.tablesService.findAll(query);
    return {
      message: responseMessage.GET_SUCCESS,
      data,
    };
  }

  // [GET] '/tables/all
  @Get('all')
  async findAllWithoutPagination() {
    const tables = await this.tablesService.findAllWithoutPagination();
    return {
      message: responseMessage.GET_SUCCESS,
      data: {
        tables,
      },
    };
  }

  //  [GET] '/tables/:id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.tablesService.findOne(+id);
    return {
      message: responseMessage.GET_SUCCESS,
      data: {
        table: result,
      },
    };
  }

  // [PATCH] /tables/:id
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    const result = await this.tablesService.update(Number(id), updateTableDto);
    return {
      message: responseMessage.UPDATE_SUCCESS,
      data: { table: result },
    };
  }

  //  [DELETE] /tables/:id
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.tablesService.remove(+id);
    return {
      message: responseMessage.DELETE_SUCCESS,
    };
  }
}
