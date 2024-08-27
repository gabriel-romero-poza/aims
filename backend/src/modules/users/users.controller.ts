import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get(':dni')
  async getUserByDni(@Param('dni') dni: string) {
    return this.usersService.findUserByDni(dni);
  }

  @Get()
  async getUsers() {
    return this.usersService.findUsers();
  }

  @Patch('update')
  async updateUser(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(updateUserDto);
  }

  @Delete(':dni')
  async deleteUser(@Param('dni') dni: string) {
    return this.usersService.deleteUser(dni);
  }
}
