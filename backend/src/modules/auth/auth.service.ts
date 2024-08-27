import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<{ access_token: string }> {
    const user = await this.usersService.findUserByDni(signInDto.dni);

    if (user?.password === signInDto.password) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, dni: user.dni };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
