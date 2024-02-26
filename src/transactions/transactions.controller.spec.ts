import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateDepositDto } from './dto/deposit.dto';
import { IRequestPayload, ITransferResponse, UserRoles } from '../types';
import { UsersService } from '../users/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let transactionsService: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: {
            transferFunds: jest.fn((x) => x),
            depositFunds: jest.fn((x) => x),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn((x) => x),
          },  
        },
        {
          provide: UsersService,
          useValue: {
            getUserByEmail: jest.fn((x) => x),
            updateUserById: jest.fn((x) => x),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn((x) => x),
            set: jest.fn((x) => x),
          },  
        }
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    transactionsService = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('transfer', () => {

    it('should transfer funds successfully', async () => {

      const mockCreateTransferDto: CreateTransferDto = {
        source: 'sourceAccountNumber',
        destination: 'destinationAccountNumber',
        amount: 100,
        pin: 1234,
      };

      const mockRequestPayload = {
        user: {
            id: 'mockUserId',
            role: UserRoles.REGULAR,
        },
        headers: { 'idempotency-key': '123' },
      } as unknown as IRequestPayload;
    
      const mockResponse = { 
        success: true,
        source: 'sourceAccountNumber',
        destination: 'destinationAccountNumber',
        amount: 100,
       };

      jest.spyOn(transactionsService, 'transferFunds').mockResolvedValueOnce(mockResponse);

      const result = await controller.transfer(mockCreateTransferDto, mockRequestPayload);

      expect(result).toEqual(mockResponse);
    });

    it("should throw an error", async () => {

      const mockCreateTransferDto: CreateTransferDto = {
        source: 'sourceAccountNumber',
        destination: 'destinationAccountNumber',
        amount: 100,
        pin: 1234,
      };

      const mockRequestPayload = {
        user: {
            id: 'mockUserId',
            role: UserRoles.REGULAR,
        },
        headers: { 'idempotency-key': '123' },
      } as unknown as IRequestPayload;

      // throws an error if the pin is incorrect
  
      jest.spyOn(transactionsService, 'transferFunds').mockImplementationOnce(() => {
        throw new HttpException("", HttpStatus.BAD_REQUEST);
      });

      try{
        await controller.transfer(mockCreateTransferDto, mockRequestPayload);
      }catch(err){
        expect(err).toBeInstanceOf(HttpException);
      }

    });
  });

  describe('deposit', () => {

    it('should deposit funds successfully', async () => {

      const mockCreateDepositDto: CreateDepositDto = {
        destination: 'destinationAccountNumber',
        amount: 100,
      };

      const mockRequestPayload = {
        user: {
            id: 'mockUserId',
            role: UserRoles.REGULAR,
        },
        headers: { 'idempotency-key': '123' },
      } as unknown as IRequestPayload;
    
      const mockResponse : ITransferResponse = { success: true, destination: 'destinationAccountNumber', amount: 100, };

      jest.spyOn(transactionsService, 'depositFunds').mockResolvedValueOnce(mockResponse);

      const result = await controller.deposit(mockCreateDepositDto, mockRequestPayload);

      expect(result).toEqual(mockResponse);
    });
    

  });

});
