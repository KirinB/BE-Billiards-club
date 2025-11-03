import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { SessionsService } from 'src/sessions/sessions.service';

@Module({
  controllers: [BillsController],
  providers: [BillsService, SessionsService],
})
export class BillsModule {}
