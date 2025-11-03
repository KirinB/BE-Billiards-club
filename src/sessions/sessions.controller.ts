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
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Request } from 'express';
import { IAuthUser } from 'src/common/interfaces/auth-user.interface';
import { FindSessionsQueryDto } from './dto/find-all-session.dto';
import { responseMessage } from 'src/common/constants/response-messages';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  //  [POST] '/sessions/
  @Post()
  async create(@Body() payload: CreateSessionDto, @Req() req: Request) {
    const user = req.user as IAuthUser;
    const result = await this.sessionsService.create(payload, user.id);

    return {
      message: 'Mở bàn thành công',
      data: {
        session: result,
      },
    };
  }

  // [GET] /sessions?page=1&pageSize=10&staffName=John
  @Get()
  async findAll(@Query() query: FindSessionsQueryDto) {
    const result = await this.sessionsService.findAll(query);
    return {
      message: responseMessage.GET_SUCCESS,
      data: result,
    };
  }

  //  [GET] /sessions/:id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const session = await this.sessionsService.findOne(+id);

    return {
      message: responseMessage.GET_SUCCESS,
      data: {
        session,
      },
    };
  }

  //  [PATCH] /sessions/:id
  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateSessionDto) {
    const session = await this.sessionsService.endSession(+id, payload);

    return {
      message: 'End session successfully',
      data: {
        session,
      },
    };
  }

  //  [DELETE] /sessions/:id
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.sessionsService.remove(+id);

    return {
      message: responseMessage.DELETE_SUCCESS,
    };
  }
}
