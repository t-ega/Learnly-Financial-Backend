import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AccountsService } from './accounts.service';
import { Account } from './account.schema';
import { TransactionsService } from 'src/transactions/transactions.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Transaction } from 'src/transactions/transactions.schema';

describe('AccountsService', () => {
  let service: AccountsService;
  let accountModel: Model<Account>;
  let transactionsService: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        TransactionsService,
        {
          provide: getModelToken(Account.name),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findOneAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    accountModel = module.get<Model<Account>>(getModelToken(Account.name));
    transactionsService = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('should create a new account', async () => {
      const createAccountDto: CreateAccountDto = {
        owner: 'John Doe',
        pin: '1234',
      };

      const hashedPin = 'hashedPin';
      const accountNumber = '2100000000';

      const findOneSpy = jest.spyOn(accountModel, 'findOne').mockResolvedValueOnce(null);
      const saveSpy = jest.spyOn(accountModel.prototype, 'save').mockResolvedValueOnce({
        owner: createAccountDto.owner,
        pin: hashedPin,
        accountNumber: accountNumber,
      } as Account);
      const bcryptSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce(hashedPin);
      const generateAccountNumberSpy = jest.spyOn(service, 'generateAccountNumber').mockReturnValueOnce(accountNumber);

      const result = await service.create(createAccountDto);

      expect(findOneSpy).toHaveBeenCalledWith({ owner: createAccountDto.owner });
      expect(bcryptSpy).toHaveBeenCalledWith(createAccountDto.pin.toString(), 10);
      expect(generateAccountNumberSpy).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalled();
      expect(result).toEqual({
        owner: createAccountDto.owner,
        pin: hashedPin,
        accountNumber: accountNumber,
      });
    });

    it('should not create a new account if an account with the same owner already exists', async () => {
      const createAccountDto: CreateAccountDto = {
        owner: 'John Doe',
        pin: '1234',
      };

      const existingAccount: Account = {
        owner: createAccountDto.owner,
        pin: 'hashedPin',
        accountNumber: '2100000000',
      };

      jest.spyOn(accountModel, 'findOne').mockResolvedValueOnce(existingAccount);

      const result = await service.create(createAccountDto);

      expect(result).toEqual(existingAccount);
    });
  });


  describe('updateAccount', () => {
    it('should update an account', async () => {
      const accountNumber = '2100000000';
      const updateAccountDto: UpdateAccountDto = {
        owner: 'Jane Smith',
        pin: "4321",
      };

      const updatedAccount: Account = {
        owner: updateAccountDto.owner,
        pin: 'hashedPin',
        accountNumber: accountNumber,
      };

      const findOneAndUpdateSpy = jest.spyOn(accountModel, 'findOneAndUpdate').mockResolvedValueOnce(updatedAccount);

      const result = await service.updateAccount(accountNumber, updateAccountDto);

      expect(findOneAndUpdateSpy).toHaveBeenCalledWith({ accountNumber }, updateAccountDto, { new: true, session: undefined });
      expect(result).toEqual(updatedAccount);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});