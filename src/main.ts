import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { TokenCheck } from './auth/token/check-token.gaurd';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  //Guard
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new TokenCheck(reflector));

  //CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  //Config
  const configService = app.get(ConfigService);
  const PREFIX = configService.get<string>('API_PREFIX') || 'api';
  const PORT = configService.get<number>('PORT') || 3000;
  const DOMAIN = configService.get<string>('DOMAIN') || `http://localhost`;
  const VERSION = configService.get<number>('VERSION') || 1;

  //Setup Prefix
  const globalPrefix = `${PREFIX}/v${VERSION}`;
  app.setGlobalPrefix(globalPrefix);

  //Global Response
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // validate DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: 400,
    }),
  );

  //Cookie

  app.use(cookieParser());

  await app.listen(PORT);

  console.log(`🚀 Server đang chạy tại: ${DOMAIN}:${PORT}/${globalPrefix}`);
}
bootstrap();
