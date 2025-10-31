import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { IsPublic } from './decorators/public.decorator';
import { IAuthUser } from 'src/common/interfaces/auth-user.interface';
import { AuthError } from './enums/auth-error.enum';
import { responseMessage } from 'src/common/constants/response-messages';
import { SignUpDto } from './dto/sign-up.dto';
import { REFRESH_TOKEN_MAXAGE } from 'src/common/constants/app.constant';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //  [POST] /auth/signin
  @IsPublic()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() payload: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.signIn(payload);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_MAXAGE,
      path: '/',
    });
    return {
      message: 'Login successful',
      data: accessToken,
    };
  }

  //  [POST] /auth/signout
  @Post('signout')
  async signOut(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const user = req.user as IAuthUser;
    await this.authService.signOut(user);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }

  //  [Get] /auth/refresh
  @IsPublic()
  @Get('refresh')
  async refreshToken(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException(AuthError.REFRESH_TOKEN_MISSING);
    }

    const { accessToken, newRefreshToken } =
      await this.authService.refreshToken(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: REFRESH_TOKEN_MAXAGE,
    });

    return {
      message: responseMessage.REFRESH_SUCCESS,
      data: accessToken,
    };
  }

  //  [POST] /auth/signup
  @IsPublic()
  @Post('signup')
  async signUp(@Body() payload: SignUpDto) {
    const user = await this.authService.signUp(payload);
    return {
      message: responseMessage.SIGN_UP_SUCCESS,
      data: user,
    };
  }
}
