import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUserService: Partial<UsersService>;

  beforeEach(async () => {
    const fakeUserService: Partial<UsersService> = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    // Create a fake copy of users service
    expect(service).toBeDefined();
  });

  it('creates a new user with salted and hashed password', async () => {
    const user = await service.signup('test@test.lv', 'testpass');

    expect(user.password).not.toEqual('testpass');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  // it('throws an error if user signs up with email that is in use', async () => {
  //   fakeUserService.find = () =>
  //     Promise.resolve([{ id: 1, email: 'a', password: '1' } as User]);
  //   await expect(service.signup('a', '1')).rejects.toThrow(BadRequestException);
  // });

  it('throws an error if user signs up with email that is in use', async () => {
    fakeUserService.find = () =>
      Promise.resolve([{ id: 1, email: 'a', password: '1' } as User]);
    await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
      'email in use',
    );
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(
      service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
    ).rejects.toThrow(NotFoundException);
  });

  // it('throws if an invalid password is provided', async () => {
  //   fakeUserService.find = () =>
  //     Promise.resolve([
  //       { email: 'asdf@asdf.com', password: 'laskdjf' } as User,
  //     ]);
  //   await expect(
  //     service.signin('laskdjf@alskdfj.com', 'passowrd'),
  //   ).rejects.toThrow(BadRequestException);
  // });
});
