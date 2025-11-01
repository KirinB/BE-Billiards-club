import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_SECURE,
  MAIL_USER,
  MAIL_PASS,
  MAIL_FROM,
} from 'src/common/constants/app.constant';

@Module({
  imports: [
    NestMailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async () => ({
        transport: {
          host: MAIL_HOST,
          port: MAIL_PORT,
          secure: MAIL_SECURE,
          auth: {
            user: MAIL_USER,
            pass: MAIL_PASS,
          },
        },
        defaults: {
          from: `"No Reply" <${MAIL_FROM}>`,
        },
        template: {
          dir: join(process.cwd(), 'src/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  exports: [NestMailerModule],
})
export class MailerModule {}
