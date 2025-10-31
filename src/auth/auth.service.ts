import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ValidationMessages } from 'src/common/constants/validation-messages';
import {
  comparePassword,
  hashPassword,
} from 'src/common/helpers/hash-password.helper';
import { IAuthUser } from 'src/common/interfaces/auth-user.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthError } from './enums/auth-error.enum';
import { TokenPayload } from './interfaces/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  //  [POST] /auth/signin
  async signIn(payload: SignInDto) {
    const { password, usernameOrEmail } = payload;

    try {
      //Tìm người dùng
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            {
              email: usernameOrEmail,
            },
            {
              username: usernameOrEmail,
            },
          ],
        },
      });

      if (!user) throw new UnauthorizedException(AuthError.USER_NOT_FOUND);

      //Hash password và kiểm tra trên hệ thống có hợp lệ không
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) throw new UnauthorizedException(AuthError.USER_NOT_FOUND);

      //Tạo accesstoken và refreshToken
      const { accessToken, refreshToken } = await this.generateUserToken({
        user,
      });

      const refreshHashed = await hashPassword(refreshToken);

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken: refreshHashed,
        },
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('SignIn error:', error);
      throw new UnauthorizedException(AuthError.USER_NOT_FOUND);
    }
  }

  // GenerateUserToken
  async generateUserToken(tokenPayload: TokenPayload) {
    const { user } = tokenPayload;
    const accessJwtSecret = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET',
    )!;
    const accessJwtExpiresIn =
      this.configService.get<string>('ACCESS_TOKEN_EXP')!;
    const refreshJwtSecret = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    )!;
    const refreshJwtExpiresIn =
      this.configService.get<string>('REFRESH_TOKEN_EXP')!;

    const payload = {
      sub: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      username: user.username,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessJwtSecret,
      expiresIn: accessJwtExpiresIn as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshJwtSecret,
      expiresIn: refreshJwtExpiresIn as any,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  //  [POST] /auth/signout
  async signOut(user: IAuthUser) {
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: null,
      },
    });
  }

  //  [GET] /auth/refresh
  async refreshToken(refreshToken: string) {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      });
    } catch (err) {
      throw new UnauthorizedException(AuthError.REFRESH_TOKEN_INVALID);
    }

    // Lấy user theo ID
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException(AuthError.USER_NOT_FOUND);

    if (!user.refreshToken) {
      throw new UnauthorizedException(AuthError.REFRESH_TOKEN_INVALID);
    }

    // So sánh hashed refreshToken trong DB
    const isValid = await comparePassword(refreshToken, user.refreshToken);
    if (!isValid)
      throw new UnauthorizedException(AuthError.REFRESH_TOKEN_INVALID);

    // Tạo access + refresh mới
    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateUserToken({ user });

    const refreshHashed = await hashPassword(newRefreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshHashed },
    });

    return { accessToken, newRefreshToken };
  }

  //  [POST] /auth/signup
  async signUp(payload: SignUpDto) {
    const { email, name, password, username } = payload;

    //Kiểm tra có trùng email hay username
    const duplicateEmail = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (duplicateEmail)
      throw new ConflictException(ValidationMessages.EMAIL_TAKEN);

    const duplicateUsername = await this.prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (duplicateUsername)
      throw new ConflictException(ValidationMessages.USERNAME_TAKEN);

    //hash pass và lưu user xuống db

    const passHashed = await hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: passHashed,
        username,
      },
    });

    return {
      ...user,
      password: undefined,
      refreshToken: undefined,
    };
  }
}
