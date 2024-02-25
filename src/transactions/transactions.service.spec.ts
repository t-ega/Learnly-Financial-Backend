import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { getModelToken } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { Transaction } from './transactions.schema';
import { AccountsService } from 'src/accounts/accounts.service';
import { UsersService } from 'src/users/users.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { Account } from 'src/accounts/account.schema';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionsModel: Model<Transaction>;
  let accountsService: AccountsService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        AccountsService,
        UsersService,
        {
          provide: getModelToken(Transaction.name),
          useValue: Model,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    transactionsModel = module.get<Model<Transaction>>(getModelToken(Transaction.name));
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

      const mockSenderAccount: Account = { accountNumber: 'sourceAccountNumber', balance: 500, pin: "1234" } as Account;
      const mockRecipientAccount = { accountNumber: 'destinationAccountNumber', balance: 200 } as Account;

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

      await expect(service.transferFunds(mockCreateTransferDto)).rejects.toThrowError(HttpException);
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
      } as Account;
  
      jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(mockSenderAccount);
  
      await expect(service.transferFunds(mockCreateTransferDto)).rejects.toThrowError(HttpException);
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
      } as Account;
  
      jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(mockSenderAccount);
  
      await expect(service.transferFunds(mockCreateTransferDto)).rejects.toThrowError(HttpException);
    });
  
    // Add more test cases for other scenarios like edge cases, cache response, etc.
  });
  

  // Add more test cases for other methods like depositFunds, cacheResponse, updatePinFailedAttempts, etc.
});
