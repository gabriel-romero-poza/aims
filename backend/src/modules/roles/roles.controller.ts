import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesGuard } from 'src/common/utils/guards/roles.guard';

@Controller('roles')
@UseGuards(RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('create')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }

  @Get(':id')
  async getRoleById(@Param('id') id: number) {
    return this.rolesService.findRoleById(id);
  }

  @Get()
  async getRoles() {
    return this.rolesService.findRoles();
  }

  @Patch('update')
  async updateRole(@Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.updateRole(updateRoleDto);
  }

  @Delete(':id')
  async deleteRole(@Param('id') id: number) {
    return this.rolesService.deleteRole(id);
  }
}
