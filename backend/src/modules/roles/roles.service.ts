import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.findByName(createRoleDto.name, false);

    if (existingRole) {
      throw new ConflictException(
        `Role with name ${createRoleDto.name} already exists`,
      );
    }

    const role = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  async findById(id: number, throwError = true): Promise<Role | null> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role && throwError) {
      throw new NotFoundException(`Role with Id ${id} not found`);
    }
    return role || null;
  }

  async findByName(name: string, throwError = true): Promise<Role | null> {
    const role = await this.rolesRepository.findOne({ where: { name } });
    if (!role && throwError) {
      throw new NotFoundException(`Role with Name ${name} not found`);
    }
    return role || null;
  }

  async delete(id: number): Promise<void> {
    const result = await this.rolesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    await this.rolesRepository.remove(user);
  }
}
