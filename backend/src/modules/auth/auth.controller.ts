// auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpStatus,
  UnauthorizedException,
  InternalServerErrorException,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/common/utils/decorators/public.decorator';
import { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto,
  ) {
    const { dni, password } = loginDto;

    try {
      // Validar las credenciales del usuario (lanza UnauthorizedException si es inválido)
      const user = await this.authService.validateUser(dni, password);

      // Generar tokens JWT
      const tokens = await this.authService.login(user);

      // Establecer las cookies con los tokens
      this.setCookies(res, tokens);

      // Retornar una respuesta simple que NestJS serializará
      return { message: 'Inicio de sesión exitoso' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error; // Re-lanza excepciones conocidas
      }
      this.logger.error('Error en el login', error);
      throw new InternalServerErrorException('Error en el login');
    }
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token no proporcionado');
    }

    try {
      // Verificar el refresh token (lanza UnauthorizedException si es inválido)
      const payload = this.authService.verifyRefreshToken(refreshToken);

      // Obtener el usuario asociado con el token
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Generar nuevos tokens JWT
      const tokens = await this.authService.login(user);

      // Establecer las nuevas cookies con los tokens
      this.setCookies(res, tokens);

      // Retornar una respuesta simple que NestJS serializará
      return { message: 'Tokens renovados exitosamente' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Error al renovar tokens', error);
      throw new InternalServerErrorException('Error al renovar tokens');
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    try {
      // Limpiar las cookies de accessToken y refreshToken
      res.clearCookie('accessToken', { path: '/' });
      res.clearCookie('refreshToken', { path: '/' });

      // Retornar una respuesta simple que NestJS serializará
      return { message: 'Sesión cerrada exitosamente' };
    } catch (error) {
      this.logger.error('Error al cerrar sesión', error);
      throw new InternalServerErrorException('Error al cerrar sesión');
    }
  }

  private setCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: this.isProduction(),
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutos
      path: '/',
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: this.isProduction(),
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/',
    });
  }

  private isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }
}
