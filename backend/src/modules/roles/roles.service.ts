import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findRoleById(id: number): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async findRoles(): Promise<Role[]> {
    const roles = await this.rolesRepository.find();
    return roles;
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.rolesRepository.findOne({
      where: { name: createRoleDto.name },
    });
    if (existingRole) {
      throw new ConflictException(
        `Role with Name ${createRoleDto.name} alredy exists`,
      );
    }
    const newRole = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(newRole);
  }

  async updateRole(updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findRoleById(updateRoleDto.id);

    role.name = updateRoleDto.name;

    return this.rolesRepository.save(role);
  }

  async deleteRole(id: number): Promise<void> {
    const role = await this.findRoleById(id);
    await this.rolesRepository.remove(role);
  }
}
