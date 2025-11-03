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
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { Request } from 'express';
import { IAuthUser } from 'src/common/interfaces/auth-user.interface';
import { responseMessage } from 'src/common/constants/response-messages';

@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  async create(@Body() payload: CreateBillDto, @Req() req: Request) {
    const user = req.user as IAuthUser;

    const bill = await this.billsService.create(payload, user.id);

    return {
      message: responseMessage.CREATE_SUCCESS,
      data: {
        bill,
      },
    };
  }

  @Get()
  findAll() {
    return this.billsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBillDto: UpdateBillDto) {
    return this.billsService.update(+id, updateBillDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.billsService.remove(+id);
  }
}
