import {
  BadGatewayException,
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthError } from '../enums/auth-error.enum';

@Injectable()
export class TokenCheck extends AuthGuard('check-token') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      //401 : Token hết hạn
      if (info instanceof TokenExpiredError)
        throw new UnauthorizedException(AuthError.TOKEN_EXPIRED);
      //403: Sai token
      if (info instanceof JsonWebTokenError)
        throw new UnauthorizedException(AuthError.TOKEN_INVALID);

      if (info instanceof Error) {
        throw new UnauthorizedException(AuthError.TOKEN_MISSING);
      }

      throw err || new UnauthorizedException();
    }
    return user;
  }
}
