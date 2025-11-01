import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const { message, data: innerData, ...rest } = data || {};
        return {
          success: true,
          message: data?.message || 'Thành công',
          ...(innerData !== undefined ? { metaData: innerData } : {}),
        };
      }),
    );
  }
}
