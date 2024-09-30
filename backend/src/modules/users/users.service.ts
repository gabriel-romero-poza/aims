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
  }

  // Hashea una contraseña en texto plano
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  // Compara una contraseña en texto plano con una contraseña hasheada
  private async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Crea un nuevo usuario
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { roleId, password, ...userData } = createUserDto;
    const existingUser = await this.findByDni(userData.dni);
    if (existingUser) {
      throw new ConflictException(
        `User with DNI ${userData.dni} already exists`,
      );
    }
    const role = await this.rolesService.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
    const hashedPassword = await this.hashPassword(password);
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      roles: [role],
    });
    return this.usersRepository.save(user);
  }

  // Valida la contraseña de un usuario durante la autenticación
  async validateUserPassword(
    dni: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.findByDni(dni);
    if (user && (await this.comparePassword(password, user.password))) {
      return user;
    }
    return null;
  }

  // Encuentra y devuelve todos los usuarios con sus roles
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['roles'] });
  }

  // Encuentra un usuario por ID
  async findById(id: number, throwError = false): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (!user && throwError) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user || null;
  }

  // Encuentra un usuario por su DNI
  async findByDni(dni: string, throwError = false): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { dni },
      relations: ['roles'],
    });
    if (!user && throwError) {
      throw new NotFoundException(`User with DNI ${dni} not found`);
    }
    return user || null;
  }

  // Elimina un usuario por ID
  async delete(userId: number): Promise<void> {
    const result = await this.usersRepository.delete(userId);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  // Actualiza los datos de un usuario existente
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  // Agrega un rol a un usuario
  async addRoleToUser(userId: number, roleId: number): Promise<User> {
    const user = await this.findById(userId);
    const role = await this.rolesService.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
    if (user.roles.some((userRole) => userRole.id === roleId)) {
      throw new ConflictException(`User already has role with ID ${roleId}`);
    }
    user.roles.push(role);
    return this.usersRepository.save(user);
  }

  // Elimina un rol de un usuario
  async removeRoleFromUser(userId: number, roleId: number): Promise<User> {
    const user = await this.findById(userId);
    const roleIndex = user.roles.findIndex(
      (userRole) => userRole.id === roleId,
    );
    if (roleIndex === -1) {
      throw new NotFoundException(`User does not have role with ID ${roleId}`);
    }
    user.roles.splice(roleIndex, 1);
    if (user.roles.length === 0) {
      throw new ConflictException(
        'User must have at least one role after removal',
      );
    }
    return this.usersRepository.save(user);
  }
}
