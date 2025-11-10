import { Module } from '@nestjs/common';
import { StoreInfoService } from './store-info.service';
import { StoreInfoController } from './store-info.controller';

@Module({
  controllers: [StoreInfoController],
  providers: [StoreInfoService],
})
export class StoreInfoModule {}
