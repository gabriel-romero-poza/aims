import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findByDni: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
            addRoleToUser: jest.fn(),
            removeRoleFromUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call UsersService.create with correct data', async () => {
      const createUserDto: CreateUserDto = {
        dni: '12345678',
        password: 'password',
        roleId: 1,
      };
      const result = new User();
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createUserDto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        dni: '12345678',
        password: 'password',
        roleId: 1,
      };
      jest.spyOn(service, 'create').mockRejectedValue(new ConflictException());

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [new User()];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = new User();
      jest.spyOn(service, 'findById').mockResolvedValue(result);

      expect(await controller.findOne(1)).toBe(result);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);

      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDni', () => {
    it('should return a user by DNI', async () => {
      const result = new User();
      jest.spyOn(service, 'findByDni').mockResolvedValue(result);

      expect(await controller.findByDni('12345678')).toBe(result);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(service, 'findByDni').mockResolvedValue(null);

      await expect(controller.findByDni('12345678')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user and return the updated user', async () => {
      const updateUserDto: UpdateUserDto = { password: 'newpassword' };
      const result = new User();
      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update(1, updateUserDto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(null);

      await expect(
        controller.update(1, { password: 'newpassword' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a user by id', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue();

      await expect(controller.delete(1)).resolves.not.toThrow();
      expect(service.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(service, 'delete').mockRejectedValue(new NotFoundException());

      await expect(controller.delete(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user by id', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue();

      await expect(controller.remove(1)).resolves.not.toThrow();
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addRole', () => {
    it('should add a role to a user', async () => {
      const result = new User();
      jest.spyOn(service, 'addRoleToUser').mockResolvedValue(result);

      expect(await controller.addRole(1, 1)).toBe(result);
      expect(service.addRoleToUser).toHaveBeenCalledWith({
        userId: 1,
        roleId: 1,
      });
    });

    it('should throw NotFoundException if user or role not found', async () => {
      jest
        .spyOn(service, 'addRoleToUser')
        .mockRejectedValue(new NotFoundException());

      await expect(controller.addRole(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeRole', () => {
    it('should remove a role from a user', async () => {
      const result = new User();
      jest.spyOn(service, 'removeRoleFromUser').mockResolvedValue(result);

      expect(await controller.removeRole(1, 1)).toBe(result);
      expect(service.removeRoleFromUser).toHaveBeenCalledWith({
        userId: 1,
        roleId: 1,
      });
    });

    it('should throw NotFoundException if user or role not found', async () => {
      jest
        .spyOn(service, 'removeRoleFromUser')
        .mockRejectedValue(new NotFoundException());

      await expect(controller.removeRole(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if trying to remove the last role', async () => {
      jest
        .spyOn(service, 'removeRoleFromUser')
        .mockRejectedValue(new ConflictException());

      await expect(controller.removeRole(1, 1)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
