import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByDni', () => {
    it('should return a user if found', async () => {
      const dni = '12345678';
      const user = new User();
      user.dni = dni;

      jest.spyOn(repository, 'findOne').mockResolvedValue(user);

      expect(await service.findUserByDni(dni)).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      const dni = '12345678';
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findUserByDni(dni)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
