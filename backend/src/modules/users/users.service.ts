// Este es el servicio de los usuarios, osea, donde recibimos la informacion que envia el controlador y la manipulamos junto con la base de datos

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findUserByDni(dni: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { dni } });
    if (!user) {
      throw new NotFoundException(`User with DNI ${dni} not found`);
    }

    //retornamos el usuario que coincide con el dni ingresado
    return user;
  }

  async findUsers(): Promise<User[]> {
    const users = await this.usersRepository.find();

    //retornamos todos los usuarios de la base de datos
    return users;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { roles, ...userData } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: { dni: createUserDto.dni },
    });
    if (existingUser) {
      throw new ConflictException(
        `User with DNI ${createUserDto.dni} alredy exists`,
      );
    }

    // Crear el nuevo usuario
    const user = this.usersRepository.create(userData);

    // Si se proporcionaron roles, buscarlos en la base de datos
    if (roles && roles.length > 0) {
      const rolesFound = await this.rolesRepository.find({
        where: roles.map((roleName) => ({ name: roleName })),
      });
      user.roles = rolesFound;
    }

    // Guardar el usuario en la base de datos
    return this.usersRepository.save(user);
  }

  async updateUser(updateUserDto: UpdateUserDto): Promise<User> {
    const { roles, ...userData } = updateUserDto;
    const user = await this.findUserByDni(userData.dni);

    // Si hay contraseña, la actualizamos
    if (userData.password) {
      user.password = userData.password;
    }

    // Si hay más roles que cero (si hay), los buscamos en la base de datos y los guardamos en rolesFound, de ahi guardamos esos roles
    // encontrados en el usuario ingresado
    if (roles && roles.length > 0) {
      const rolesFound = await this.rolesRepository.find({
        where: roles.map((roleName) => ({ name: roleName })),
      });
      user.roles = rolesFound;
    }

    return this.usersRepository.save(user);
  }

  async deleteUser(dni: string): Promise<void> {
    const user = await this.findUserByDni(dni);
    await this.usersRepository.remove(user);
  }
}
