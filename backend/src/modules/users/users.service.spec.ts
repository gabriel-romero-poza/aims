import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { RolesService } from '../roles/roles.service';
import { Role } from '../roles/entities/role.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let rolesService: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: RolesService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    rolesService = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        dni: '12345678',
        password: 'password',
        roleId: 1,
      };
      const role = { id: 1, name: 'alumno' };
      const user = new User();
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(rolesService, 'findById').mockResolvedValue(role as any);
      jest.spyOn(repository, 'create').mockReturnValue(user);
      jest.spyOn(repository, 'save').mockResolvedValue(user);

      const result = await service.create(createUserDto);
      expect(result).toBe(user);
      expect(repository.create).toHaveBeenCalledWith({
        dni: '12345678',
        password: 'password',
      });
      expect(repository.save).toHaveBeenCalledWith(user);
    });

    it('should throw ConflictException if user with DNI already exists', async () => {
      const createUserDto = {
        dni: '12345678',
        password: 'password',
        roleId: 1,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(new User());

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [new User()];
      jest.spyOn(repository, 'find').mockResolvedValue(users);

      expect(await service.findAll()).toBe(users);
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      const user = new User();
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);

      expect(await service.findById(1)).toBe(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDni', () => {
    it('should return a user by DNI', async () => {
      const user = new User();
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);

      expect(await service.findByDni('12345678')).toBe(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findByDni('12345678')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user and return the updated user', async () => {
      const updateUserDto = { password: 'newpassword' };
      const user = new User();
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(repository, 'save').mockResolvedValue(user);

      const result = await service.update(1, updateUserDto);
      expect(result).toBe(user);
      expect(repository.save).toHaveBeenCalledWith({
        ...user,
        ...updateUserDto,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        service.update(1, { password: 'newpassword' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a user by ID', async () => {
      const user = new User();
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(repository, 'delete').mockResolvedValue(undefined);

      await expect(service.delete(1)).resolves.not.toThrow();
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user by ID', async () => {
      const user = new User();
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(repository, 'remove').mockResolvedValue(user);

      await expect(service.remove(1)).resolves.not.toThrow();
      expect(repository.remove).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addRoleToUser', () => {
    it('should add a role to a user', async () => {
      const user = new User();
      const role = { id: 1, name: 'alumno' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(rolesService, 'findById').mockResolvedValue(role as any);
      jest.spyOn(repository, 'save').mockResolvedValue(user);

      const result = await service.addRoleToUser(1, 1);
      expect(result).toBe(user);
      expect(repository.save).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.addRoleToUser(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if role not found', async () => {
      const user = new User();
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(rolesService, 'findById').mockResolvedValue(null);

      await expect(service.addRoleToUser(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeRoleFromUser', () => {
    it('should throw BadRequestException if trying to remove the last role', async () => {
      const user = new User();
      user.roles = [
        {
          id: 1,
          name: 'alumno',
          users: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]; // El usuario tiene solo un rol

      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(repository, 'save').mockResolvedValue(user); // Mock de save para evitar errores

      jest.spyOn(rolesService, 'findById').mockResolvedValue({
        id: 1,
        name: 'alumno',
        users: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Role);

      await expect(service.removeRoleFromUser(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
