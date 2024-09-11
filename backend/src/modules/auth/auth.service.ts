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

  async validateUser(dni: string, password: string): Promise<User> {
    const user = await this.usersService.findByDni(dni, false);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    this.logger.warn(`Invalid credentials for DNI: ${dni}`);
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: User): Promise<{ accessToken: string }> {
    const payload = { username: user.dni, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
