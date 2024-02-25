import {  Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException } from '@nestjs/common';

import { TransactionsService } from './transactions.service';
import { Transaction } from './transactions.schema';
import { AccountsService } from '../accounts/accounts.service';
import { UsersService } from '../users/users.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { IAccount } from '../types';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let accountsService: AccountsService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TransactionsService,
          useValue: {
            transferFunds: jest.fn(),
          },
        },
        {
          provide: AccountsService,
          useValue: {
            findAccountByAccountNumber: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findUserById: jest.fn(),
          },
        },

      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    accountsService = module.get<AccountsService>(AccountsService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transferFunds', () => {
    it('should transfer funds successfully', async () => {
      const mockCreateTransferDto: CreateTransferDto = {
        source: 'sourceAccountNumber',
        destination: 'destinationAccountNumber',
        amount: 100,
        pin: 1234,
      };

      const mockSenderAccount: IAccount = { accountNumber: 'sourceAccountNumber', balance: 500, pin: "1234" } as IAccount;
      const mockRecipientAccount = { accountNumber: 'destinationAccountNumber', balance: 200 } as IAccount;

      jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(mockSenderAccount);
      jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(mockRecipientAccount);

      const result = await service.transferFunds(mockCreateTransferDto);

      expect(result.success).toBe(true);
    });

    it('should throw an error if sender account does not exist', async () => {
      const mockCreateTransferDto: CreateTransferDto = {
        source: 'sourceAccountNumber',
        destination: 'destinationAccountNumber',
        amount: 100,
        pin: 1234,
      };

      jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(null);

      await expect(service.transferFunds(mockCreateTransferDto)).rejects.toThrow(HttpException);
    });
    
  });

  describe('TransactionsService', () => {
    // Existing setup and beforeEach function
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should throw an error if sender account has insufficient funds', async () => {
      const mockCreateTransferDto: CreateTransferDto = {
        source: 'sourceAccountNumber',
        destination: 'destinationAccountNumber',
        amount: 1000, // Assuming the sender has insufficient funds
        pin: 1234,
      };
  
      const mockSenderAccount = {
        _id: 'mockId',
        accountNumber: 'sourceAccountNumber',
        balance: 500,
        pin: "1234",
      } as IAccount;
  
      jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(mockSenderAccount);
      
      await service.transferFunds(mockCreateTransferDto);
      await expect(service.transferFunds(mockCreateTransferDto)).rejects.toThrow(HttpException);
    });
  
    it('should throw an error if PIN is invalid', async () => {
      const mockCreateTransferDto: CreateTransferDto = {
        source: 'sourceAccountNumber',
        destination: 'destinationAccountNumber',
        amount: 100,
        pin: 9999, // Invalid PIN
      };
  
      const mockSenderAccount = {
        _id: 'mockId',
        accountNumber: 'sourceAccountNumber',
        balance: 500,
        pin: "1234",
      } as IAccount;
  
      jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(mockSenderAccount);
  
      await expect(service.transferFunds(mockCreateTransferDto)).rejects.toThrow(HttpException);
    });
  
  });
  

 
});
