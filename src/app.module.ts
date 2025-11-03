import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CheckTokenStrategy } from './auth/token/check-token.strategy';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TablesModule } from './tables/tables.module';
import { SessionsModule } from './sessions/sessions.module';
import { CategoryModule } from './category/category.module';
import { MenuModule } from './menu/menu.module';
import { MenuItemModule } from './menu-item/menu-item.module';
import { OrdersModule } from './orders/orders.module';
import { BillsModule } from './bills/bills.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    PrismaModule,
    AuthModule,
    TablesModule,
    SessionsModule,
    CategoryModule,
    MenuModule,
    MenuItemModule,
    OrdersModule,
    BillsModule,
  ],
  controllers: [AppController],
  providers: [AppService, CheckTokenStrategy],
})
export class AppModule {}
