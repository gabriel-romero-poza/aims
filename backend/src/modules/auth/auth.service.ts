// auth.service.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService, // Instancia predeterminada
    private readonly configService: ConfigService,
  ) {}

  async validateUser(dni: string, pass: string): Promise<User> {
    this.logger.debug(`Validating user with DNI: ${dni}`);
    const user = await this.usersService.findByDni(dni);
    if (!user) {
      this.logger.warn(`User with DNI ${dni} not found.`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for DNI: ${dni}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }
    this.logger.debug(`User ${dni} validated successfully.`);
    return user;
  }

  async login(user: User) {
    const payload = { sub: user.id, roles: user.roles };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload); // Usa configuración predeterminada
  }

  generateRefreshToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn:
        this.configService.get<string>('REFRESH_TOKEN_EXPIRATION') || '7d',
    });
  }

  verifyRefreshToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch (error) {
      this.logger.warn('Invalid refresh token');
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}
