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
import { responseMessage } from 'src/common/constants/response-messages';
import { CreateMemberDto } from './dto/create-member.dto';
import { QueryFindAllMember } from './dto/find-all-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MembersService } from './members.service';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  async findAll(@Query() query: QueryFindAllMember) {
    const data = await this.membersService.findAll(query);

    return {
      message: responseMessage.GET_SUCCESS,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const member = await this.membersService.findOne(+id);

    return {
      message: responseMessage.GET_SUCCESS,
      data: {
        member,
      },
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    const member = await this.membersService.update(+id, updateMemberDto);

    return {
      message: responseMessage.UPDATE_SUCCESS,
      data: {
        member,
      },
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.membersService.remove(+id);
    return {
      message: responseMessage.DELETE_SUCCESS,
    };
  }
}
