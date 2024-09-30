import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/common/utils/decorators/public.decorator';
import { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { Logger } from '@nestjs/common';

@Controller('auth')
@Public()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto,
  ) {
    const { dni, password } = loginDto;

    // Validate user credentials (throws UnauthorizedException if invalid)
    const user = await this.authService.validateUser(dni, password);

    // Generate JWT tokens
    const tokens = await this.authService.login(user);

    // Set tokens as HTTP-only cookies
    this.setCookies(res, tokens);

    // Respond with success message
    return res.status(HttpStatus.OK).json({
      message: 'Inicio de sesión exitoso',
    });
  }

  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token no proporcionado');
    }

    // Verify the refresh token (throws UnauthorizedException if invalid)
    const payload = this.authService.verifyRefreshToken(refreshToken);

    // Fetch the user associated with the token
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Generate new JWT tokens
    const tokens = await this.authService.login(user);

    // Set new tokens as HTTP-only cookies
    this.setCookies(res, tokens);

    // Respond with success message
    return res.status(HttpStatus.OK).json({
      message: 'Tokens renovados exitosamente',
    });
  }

  private setCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutos
      path: '/',
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/',
    });
  }
}
