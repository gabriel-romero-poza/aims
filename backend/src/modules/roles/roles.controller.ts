import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Role } from './entities/role.entity';

@ApiBearerAuth()
@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un nuevo rol' })
  @ApiResponse({ status: 201, description: 'Rol creado con éxito.' })
  @ApiResponse({ status: 409, description: 'El rol ya existe.' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtiene todos los roles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles devuelta con éxito.',
    type: [Role],
  })
  async findAll(): Promise<Role[]> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un rol por su ID' })
  @ApiResponse({
    status: 200,
    description: 'Rol devuelto con éxito.',
    type: Role,
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado.' })
  async findOne(@Param('id') id: number): Promise<Role> {
    return this.rolesService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un rol por su ID' })
  @ApiResponse({ status: 204, description: 'Rol eliminado con éxito.' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado.' })
  async delete(@Param('id') id: number): Promise<void> {
    return this.rolesService.delete(id);
  }

  @Delete('remove/:id')
  @ApiOperation({
    summary:
      'Elimina un rol (utilizando remove) por su ID, cargando primero el rol',
  })
  @ApiResponse({ status: 204, description: 'Rol eliminado con éxito.' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado.' })
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(Number(id));
  }
}
