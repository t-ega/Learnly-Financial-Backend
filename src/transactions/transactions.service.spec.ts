
import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import * as bycrpt from "bcrypt";

import { TransactionsService } from './transactions.service';
import { Transaction } from './transactions.schema';
import { AccountsService } from '../accounts/accounts.service';
import { UsersService } from '../users/users.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { IAccount } from '../types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException } from '@nestjs/common';
import { CreateDepositDto } from './dto/deposit.dto';

// const USER_REPOSITORY_TOKEN = getModelToken()
describe('TransactionsService', () => {
  let service: TransactionsService;
  let accountsService: AccountsService;
  let usersService: UsersService;
  let model: Model<Transaction>;

  const mockUserModel = { 
    startSession: jest.fn((x) => ({
      startTransaction : jest.fn(),
      commitTransaction: jest.fn(),
      endSession: jest.fn(),
      abortTransaction: jest.fn()
    })),
    save: jest.fn((x) => x),
    create: jest.fn((x)=> ({
      save: jest.fn()
    }))
  }

   

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getModelToken(Transaction.name),
          useValue: mockUserModel
        },
        
        {
          provide: CACHE_MANAGER,
          useValue: {}
        },
        {
          provide: AccountsService,
          useValue: {
            findAccountByAccountNumber: jest.fn(),
            updateAccount: jest.fn((x) => x)
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
    model = module.get<Model<Transaction>>(getModelToken(Transaction.name))
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('account service should be defined', () => {
    expect(accountsService).toBeDefined();
  });

  describe('transferFunds', () => {
    const req_user_id = "1";

    it('should transfer funds successfully', async () => {
      const mockCreateTransferDto: CreateTransferDto = {
        source: 'sourceAccountNumber',
        destination: 'destinationAccountNumber',
        amount: 100,
        pin: 1234,
      };

      jest.spyOn(bycrpt, "compare").mockImplementationOnce(() => true);

      const mockSenderAccount = { accountNumber: 'sourceAccountNumber', owner: {id: "1"}, balance: 500, pin: "1234" } as IAccount;
      const mockRecipientAccount = { accountNumber: 'destinationAccountNumber', balance: 200 } as IAccount;

      jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(mockSenderAccount);
      jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(mockRecipientAccount);

      const result = await service.transferFunds(req_user_id, mockCreateTransferDto);
      expect(bycrpt.compare).toHaveBeenCalled();

      expect(accountsService.findAccountByAccountNumber).toHaveBeenCalledWith(mockSenderAccount.accountNumber)
      expect(accountsService.findAccountByAccountNumber).toHaveBeenCalledWith(mockRecipientAccount.accountNumber);
      
      // for both sender and reciever
      expect(accountsService.updateAccount).toHaveBeenCalledTimes(2);
      
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

      await expect(service.transferFunds(req_user_id, mockCreateTransferDto)).rejects.toThrow(HttpException);
    });

    it('should throw an error if recipient account does not exist', async () => {

      const mockCreateTransferDto: CreateTransferDto = {
        source: 'sourceAccountNumber',
        destination: 'destinationAccountNumber',
        amount: 100,
        pin: 1234,
      };

      const mockSenderAccount = {
        owner : {
          _id: '1', 
        },
        accountNumber: 'sourceAccountNumber',
        balance: 500,
        pin: "1234",
      } as unknown as IAccount;

      jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(mockSenderAccount);
      jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(null);

      await expect(service.transferFunds(req_user_id, mockCreateTransferDto)).rejects.toThrow(HttpException);
    });

    it('should throw an error if source and destination account are the same', async () => {

      const mockCreateTransferDto: CreateTransferDto = {
        source: 'sourceAccountNumber',
        destination: 'sourceAccountNumber',
        amount: 100,
        pin: 1234,
      };

      await expect(service.transferFunds(req_user_id, mockCreateTransferDto)).rejects.toThrow(HttpException);
    });

    it('should throw an error if sender account has insufficient funds', async () => {
        const mockCreateTransferDto: CreateTransferDto = {
          source: 'sourceAccountNumber',
          destination: 'destinationAccountNumber',
          amount: 1000, // Assuming the sender has insufficient funds
          pin: 1234,
        };

        const mockSenderAccount = {
          owner : {
            _id: '1', 
          },
          accountNumber: 'sourceAccountNumber',
          balance: 500,
          pin: "1234",
        } as unknown as IAccount;
        
        const mockRecipientAccount = { accountNumber: 'destinationAccountNumber', balance: 200 } as IAccount;
    
        jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(mockSenderAccount);
        jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(mockRecipientAccount);
        
        await expect(service.transferFunds(req_user_id, mockCreateTransferDto)).rejects.toThrow(HttpException);
      });

  
      it('should throw an error if PIN is invalid', async () => {

        const mockCreateTransferDto: CreateTransferDto = {
          source: 'sourceAccountNumber',
          destination: 'destinationAccountNumber',
          amount: 100,
          pin: 9999, // Invalid PIN
        };
    
        const mockSenderAccount = {
          owner : {
            _id: '1', 
          },
          accountNumber: 'sourceAccountNumber',
          balance: 500,
          pin: "1234",
        } as unknown as IAccount;
        
        const mockRecipientAccount = { accountNumber: 'destinationAccountNumber', balance: 200 } as IAccount;
        
        jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(mockSenderAccount);
        jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(mockRecipientAccount);
    
        await expect(service.transferFunds(req_user_id, mockCreateTransferDto)).rejects.toThrow(HttpException);
      });

      it("should not allow a user transfer from another account", async () => {
        const mockCreateTransferDto: CreateTransferDto = {
          source: 'sourceAccountNumber',
          destination: 'destinationAccountNumber',
          amount: 100,
          pin: 9999, 
        };

      const req_user_id = "1";

        const mockSenderAccount = {
          owner : {
            _id: '3', // Id on the sender account is not the same as the requesting user 
          },
          accountNumber: 'sourceAccountNumber',
          balance: 500,
          pin: "1234",
        } as unknown as IAccount;
        
        const mockRecipientAccount = { accountNumber: 'destinationAccountNumber', balance: 200 } as IAccount;
        
        jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(mockSenderAccount);
        jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(mockRecipientAccount);
        
        expect(service.transferFunds(req_user_id, mockCreateTransferDto)).rejects.toThrow(HttpException);

      })
            
  });

  describe('depositFunds', () => {

    const mockCreateDepositDto: CreateDepositDto = {
      destination: 'destinationAccountNumber',
      amount: 100,
    };

    const mockDestinationAccount = {
      owner : {
        _id: '1',
      },
      accountNumber: 'sourceAccountNumber',
      balance: 500,
      pin: "1234",
    } as unknown as IAccount;

    it("should deposit funds successfully", async () => {
      jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(mockDestinationAccount);

      const result = await service.depositFunds(mockCreateDepositDto);

      expect(accountsService.updateAccount).toHaveBeenCalledTimes(1)
      expect(result.success).toBe(true)
    
    })

    it("should throw an error if destination account doesnt exist", async () => {
  
      jest.spyOn(accountsService, 'findAccountByAccountNumber').mockResolvedValueOnce(null);
      
      expect(service.depositFunds(mockCreateDepositDto)).rejects.toThrow(HttpException);

    })
   
  });
  

 
});
