import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

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
            createUser: jest.fn(),
            findByDni: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
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

  describe('createUser', () => {
    it('should call UsersService.createUser with correct data', async () => {
      const createUserDto: CreateUserDto = {
        dni: '12345678',
        password: 'password',
        role: 'alumno',
      };
      const result = new User();
      jest.spyOn(service, 'createUser').mockResolvedValue(result);

      expect(await controller.createUser(createUserDto)).toBe(result);
      expect(service.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });
});
