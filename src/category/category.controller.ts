import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { responseMessage } from 'src/common/constants/response-messages';
import { FindCategoriesQueryDto } from './dto/find-all-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  //[POST] '/category/'
  @Post()
  async create(@Body() payload: CreateCategoryDto) {
    const category = await this.categoryService.create(payload);
    return {
      message: responseMessage.CREATE_SUCCESS,
      data: {
        category,
      },
    };
  }

  //  [GET] '/category/'
  @Get()
  async findAll(@Query() query: FindCategoriesQueryDto) {
    const result = await this.categoryService.findAll(query);

    return {
      message: responseMessage.GET_SUCCESS,
      data: result,
    };
  }

  // [GET] '/category/all'
  @Get('all')
  async findAllWithoutPagination() {
    const categories = await this.categoryService.findAllWithoutPagination();
    return {
      message: responseMessage.GET_SUCCESS,
      data: { categories },
    };
  }

  //  [GET] '/category/:id'
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.categoryService.findOne(+id);
    return {
      message: responseMessage.GET_SUCCESS,
      data: {
        category,
      },
    };
  }

  //  [PATCH] '/category/:id'
  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateCategoryDto) {
    const category = await this.categoryService.update(+id, payload);

    return {
      message: responseMessage.UPDATE_SUCCESS,
      data: {
        category,
      },
    };
  }

  //  [DELETE] '/category/:id'
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.categoryService.remove(+id);

    return {
      message: responseMessage.DELETE_SUCCESS,
    };
  }
}
