import { Post, Body, Controller, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.authService.validateUser(
        loginDto.dni,
        loginDto.password,
      );
      const result = await this.authService.login(user);
      console.log(`User logged in successfully: ${user.dni}`);
      return result;
    } catch (error) {
      console.error(`Login failed for DNI: ${loginDto.dni}`);
    }
  }
}
