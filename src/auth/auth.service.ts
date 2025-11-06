import { MailerService } from '@nestjs-modules/mailer';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  FRONTEND_URL,
  REFRESH_TOKEN_MAXAGE,
  RESET_TOKEN_EXPIRY_MINUTES,
  RESET_TOKEN_MAXAGE,
  TEST_RECEIVER_EMAIL,
} from 'src/common/constants/app.constant';
import { ValidationMessages } from 'src/common/constants/validation-messages';
import {
  comparePassword,
  hashPassword,
} from 'src/common/helpers/hash-password.helper';
import { IAuthUser } from 'src/common/interfaces/auth-user.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthError } from './enums/auth-error.enum';
import { TokenPayload } from './interfaces/token-payload.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
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

      await this.prisma.token.upsert({
        where: {
          userId_type: { userId: user.id, type: 'REFRESH' },
        },
        update: {
          token: refreshHashed,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAXAGE),
          revoked: false,
        },

        create: {
          userId: user.id,
          token: refreshHashed,
          type: 'REFRESH',
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAXAGE),
          revoked: false,
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
    try {
      await this.prisma.token.updateMany({
        where: {
          userId: 1,
          type: 'REFRESH',
          revoked: false,
        },
        data: {
          revoked: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
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

    const storedToken = await this.prisma.token.findUnique({
      where: { userId_type: { userId: payload.sub, type: 'REFRESH' } },
    });

    if (!storedToken)
      throw new UnauthorizedException('Refresh token not found');

    if (storedToken.revoked)
      throw new UnauthorizedException('Token has been revoked');

    if (storedToken.expiresAt && storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Token expired');
    }

    // So sánh hashed refreshToken trong DB
    const isValid = await comparePassword(refreshToken, storedToken.token);
    if (!isValid)
      throw new UnauthorizedException(AuthError.REFRESH_TOKEN_INVALID);

    // Tạo access + refresh mới
    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateUserToken({ user });

    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_MAXAGE);
    const refreshHashed = await hashPassword(newRefreshToken);

    await this.prisma.token.update({
      where: { id: storedToken.id },
      data: {
        token: refreshHashed,
        expiresAt: newExpiresAt,
        revoked: false,
      },
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

  async sendResetPasswordEmail(email: string, token: string, name?: string) {
    try {
      const recipient = TEST_RECEIVER_EMAIL || email;

      const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

      await this.mailerService.sendMail({
        to: recipient,
        subject: 'Reset your password',
        template: 'reset-password',
        context: {
          name: name || 'User',
          expiryMinutes: RESET_TOKEN_EXPIRY_MINUTES,
          resetLink,
          token,
        },
      });

      console.log('Email sent successfully');
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  //  [POST] "auth/forgot-password"
  async forgotPassword(payload: ForgotPasswordDto) {
    try {
      const { email } = payload;

      // Kiểm tra email tồn tại hay không nếu không cũng không quăng lỗi
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user)
        return { message: `Đã gửi tới ${email} link để cập nhật lại mật khẩu` };

      //Tạo một token reset_password
      const token = uuidv4();

      await this.prisma.token.upsert({
        where: {
          userId_type: {
            type: 'RESET_PASSWORD',
            userId: user.id,
          },
        },
        update: {
          token,
          revoked: false,
          expiresAt: new Date(Date.now() + RESET_TOKEN_MAXAGE),
        },
        create: {
          user: { connect: { id: user.id } },
          type: 'RESET_PASSWORD',
          token,
          revoked: false,
          expiresAt: new Date(Date.now() + RESET_TOKEN_MAXAGE),
        },
      });

      await this.sendResetPasswordEmail(user.email, token);

      return { message: `Đã gửi tới ${email} link để cập nhật lại mật khẩu` };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async resetPassword(payload: ResetPasswordDto) {
    const { token, password } = payload;

    //Kiểm tra token hợp lệ hay không
    const tokenRecord = await this.prisma.token.findFirst({
      where: {
        revoked: false,
        token,
        type: 'RESET_PASSWORD',
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!tokenRecord)
      throw new UnauthorizedException(AuthError.TOKEN_INVALID_OR_EXPIRED);

    //hash password và cập nhật lại user
    const passHashed = await hashPassword(password);

    const [user] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { password: passHashed },
      }),
      this.prisma.token.update({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      }),
    ]);

    return { ...user, password: undefined };
  }
}
