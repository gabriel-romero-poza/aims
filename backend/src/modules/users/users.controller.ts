import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Rutas específicas (con parámetros de URL) primero
  @Get('profile')
  getProfile(@Request() req) {
    console.log(req.user);
    return req.user;
  }

  @Get('dni/:dni')
  @ApiOperation({ summary: 'Obtiene un usuario por su DNI' })
  @ApiResponse({ status: 200, description: 'Usuario devuelto con éxito.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async findByDni(@Param('dni') dni: string) {
    return this.usersService.findByDni(dni, true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un usuario por su ID' })
  @ApiResponse({ status: 200, description: 'Usuario devuelto con éxito.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id, true);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza parcialmente un usuario por su ID' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado con éxito.' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un usuario por su ID (delete)' })
  @ApiResponse({ status: 204, description: 'Usuario eliminado con éxito.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.delete(id);
  }

  // Rutas relacionadas con roles de usuarios
  @Post(':userId/roles/:roleId')
  @ApiOperation({ summary: 'Agrega un rol a un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Rol agregado al usuario con éxito.',
  })
  @ApiResponse({ status: 404, description: 'Rol o usuario no encontrado.' })
  @ApiResponse({ status: 409, description: 'El usuario ya tiene este rol.' })
  async addRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.usersService.addRoleToUser(userId, roleId);
  }

  @Delete(':userId/roles/:roleId')
  @ApiOperation({ summary: 'Elimina un rol de un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Rol eliminado del usuario con éxito.',
  })
  @ApiResponse({ status: 404, description: 'Rol o usuario no encontrado.' })
  @ApiResponse({
    status: 409,
    description: 'El usuario debe tener al menos un rol.',
  })
  async removeRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.usersService.removeRoleFromUser(userId, roleId);
  }

  // Rutas generales (sin parámetros específicos) al final
  @Get()
  @ApiOperation({ summary: 'Obtiene todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios devuelta con éxito.',
  })
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crea un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado con éxito.' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  @ApiResponse({ status: 409, description: 'Conflicto, el usuario ya existe.' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
