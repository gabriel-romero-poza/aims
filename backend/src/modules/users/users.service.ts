import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from '../roles/roles.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private readonly saltRounds: number;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly rolesService: RolesService,
    private configService: ConfigService,
  ) {
    this.saltRounds = parseInt(
      this.configService.get<string>('BCRYPT_SALT_ROUNDS', '10'),
      10,
    );
    console.log('Salt rounds:', this.saltRounds);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  private async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { roleId, password, ...userData } = createUserDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.findByDni(userData.dni, false);
    if (existingUser) {
      throw new ConflictException(
        `User with DNI ${userData.dni} already exists`,
      );
    }

    // Buscar el rol en la base de datos usando el roleId proporcionado
    const role = await this.rolesService.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // Hash de la contraseña
    const hashedPassword = await this.hashPassword(password);

    // Crear el nuevo usuario
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      roles: [role],
    });

    // Guardar el usuario en la base de datos
    return this.usersRepository.save(user);
  }

  async validateUserPassword(dni: string, password: string): Promise<User> {
    const user = await this.findByDni(dni);
    if (user && (await this.comparePassword(password, user.password))) {
      return user;
    }
    return null;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['roles'] });
  }

  async findById(id: number, throwError = true): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (!user && throwError) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user || null;
  }

  async findByDni(dni: string, throwError = true): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { dni },
      relations: ['roles'],
    });
    if (!user && throwError) {
      throw new NotFoundException(`User with DNI ${dni} not found`);
    }
    return user || null;
  }

  async delete(userId: number): Promise<void> {
    const result = await this.usersRepository.delete(userId);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  async remove(userId: number): Promise<void> {
    const user = await this.findById(userId);
    await this.usersRepository.remove(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // Actualiza solo los campos proporcionados en el DTO
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }
    Object.assign(user, updateUserDto);

    // Guardar los cambios en la base de datos
    return this.usersRepository.save(user);
  }

  async addRoleToUser(userId: number, roleId: number): Promise<User> {
    const user = await this.findById(userId);

    // Buscar el rol en la base de datos
    const role = await this.rolesService.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // Verificar si el usuario ya tiene ese rol
    if (user.roles.some((userRole) => userRole.id === roleId)) {
      throw new ConflictException(`User already has role with ID ${roleId}`);
    }

    // Agregar el rol al usuario y guardar los cambios
    user.roles.push(role);
    return this.usersRepository.save(user);
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<User> {
    const user = await this.findById(userId);

    // Buscar el rol en la base de datos
    const role = await this.rolesService.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // Verificar si el usuario tiene ese rol
    const roleIndex = user.roles.findIndex(
      (userRole) => userRole.id === roleId,
    );
    if (roleIndex === -1) {
      throw new NotFoundException(`User does not have role with ID ${roleId}`);
    }

    // Eliminar el rol del usuario y guardar los cambios
    user.roles.splice(roleIndex, 1);

    // Verificar que al menos un rol permanezca en el usuario
    if (user.roles.length === 0) {
      throw new ConflictException(
        'User must have at least one role after removal',
      );
    }
    return this.usersRepository.save(user);
  }

  async validatePassword(dni: string, plainPassword: string): Promise<boolean> {
    const user = await this.findByDni(dni);
    if (!user) {
      throw new NotFoundException(`User with DNI ${dni} not found`);
    }
    return bcrypt.compare(plainPassword, user.password);
  }
}
