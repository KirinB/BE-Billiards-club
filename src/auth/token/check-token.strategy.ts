import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ACCESS_TOKEN_SECRET } from 'src/common/constants/app.constant';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CheckTokenStrategy extends PassportStrategy(
  Strategy,
  'check-token',
) {
  constructor(public prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: ACCESS_TOKEN_SECRET as string,
    });
  }

  async validate(payload: any) {
    console.log({ payload });
    const user = await this.prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    return user;
  }
}
