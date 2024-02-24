import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { UserRoles } from 'src/types';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            getUserByEmail: jest.fn(),
            updateUserById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should login user and return auth token', async () => {
      const mockUser = {
        _id: '1',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        phoneNumber: '1234567890',
        isActive: true,
        role: UserRoles.REGULAR,
        lastLogin: null,
      };
      const mockPayload = { id: '1', role: UserRoles.REGULAR };
      const mockToken = 'mock_token';

      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(mockToken);

      const result = await service.login(mockUser.email, 'password123');

      expect(userService.getUserByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockPayload);
      expect(result).toEqual({ x_auth_token: mockToken });
    });

    it('should throw error for invalid credentials', async () => {
      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(null);

      await expect(service.login('invalid@example.com', 'invalidpassword')).rejects.toBe(HttpException);
      await expect(service.login('invalid@example.com', 'invalidpassword')).rejects.toBe('Email or password incorrect');
    });
  });

  describe('logout', () => {
    it('should remove authorization header', async () => {
      const mockResponse = { removeHeader: jest.fn() } as unknown as Response;

      await service.logout(mockResponse);

      expect(mockResponse.removeHeader).toHaveBeenCalledWith('authorization');
    });
  });
});
