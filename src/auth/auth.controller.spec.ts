import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should sign in user and return success message', async () => {
      const signInDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockDetails = { x_auth_token: 'mock_token' };
      const mockResponse = { setHeader: jest.fn(), status: jest.fn(), json: jest.fn() } as unknown as Response;

      jest.spyOn(authService, 'login').mockResolvedValue(mockDetails);

      await controller.signIn(signInDto, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(signInDto.email, signInDto.password);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('authorization', `Bearer ${mockDetails.x_auth_token}`);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('should handle invalid credentials', async () => {
      const signInDto: LoginDto = {
        email: 'invalid@example.com',
        password: 'invalidpassword',
      };

      const mockResponse = { setHeader: jest.fn(), status: jest.fn(), json: jest.fn() } as unknown as Response;

      jest.spyOn(authService, 'login').mockRejectedValue(new Error('Email or password incorrect'));

      await expect(controller.signIn(signInDto, mockResponse)).rejects.toThrowError('Email or password incorrect');

      expect(authService.login).toHaveBeenCalledWith(signInDto.email, signInDto.password);
      expect(mockResponse.setHeader).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('should sign out user', async () => {
      const mockResponse = { removeHeader: jest.fn() } as unknown as Response;

      await controller.signOut(mockResponse);

      expect(mockResponse.removeHeader).toHaveBeenCalledWith('authorization');
    });
  });
});
