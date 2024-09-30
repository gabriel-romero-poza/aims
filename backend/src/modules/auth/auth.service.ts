import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(dni: string, pass: string): Promise<any> {
    this.logger.debug(`Validating user with DNI: ${dni}`);
    const user = await this.usersService.findByDni(dni);
    if (!user) {
      this.logger.warn(`User nigg with DNI ${dni} not found.`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for DNI: ${dni}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password, ...result } = user;
    this.logger.debug(`User ${dni} validated successfully.`);
    return result;
  }

  async login(user: User) {
    const payload = { sub: user.id, roles: user.roles };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  verifyRefreshToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
    } catch (error) {
      this.logger.warn('Invalid refresh token');
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}
