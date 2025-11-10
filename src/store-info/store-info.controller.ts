import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UpdateStoreInfoDto } from './dto/update-store-info.dto';
import { StoreInfoService } from './store-info.service';
import { responseMessage } from 'src/common/constants/response-messages';
import { IsPublic } from 'src/auth/decorators/public.decorator';

@Controller('store-info')
export class StoreInfoController {
  constructor(private readonly storeInfoService: StoreInfoService) {}

  @IsPublic()
  @Get()
  async getStore() {
    const info = await this.storeInfoService.getStore();
    return {
      message: responseMessage.GET_SUCCESS,
      data: {
        info,
      },
    };
  }

  @Patch()
  async update(@Body() payload: UpdateStoreInfoDto) {
    const info = await this.storeInfoService.update(payload);
    return {
      message: responseMessage.UPDATE_SUCCESS,
      data: {
        info,
      },
    };
  }
}
