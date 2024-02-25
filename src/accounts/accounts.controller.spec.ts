import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { IAccount, IRequestPayload, UserRoles } from 'src/types';
import { HydratedDocument } from 'mongoose';

describe('AccountsController', () => {
  let controller: AccountsController;
  let accountsService: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        {
          provide: AccountsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findAccountByUserId: jest.fn(),
            findAccountByAccountNumber: jest.fn(),
            getMyTransactions: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
    accountsService = module.get<AccountsService>(AccountsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new account', async () => {

      const createAccountDto: CreateAccountDto = {
        owner: '232943895ff435678cd',
        pin: 1234,
      };

      const createdAccount: HydratedDocument<IAccount> = {
        owner: {
          id: '232943895ff435678cd',
          role: UserRoles.REGULAR,
        },
        balance: 0,
        accountNumber: '1234567890',
        pin: '1234',
      } as HydratedDocument<IAccount>;

      jest.spyOn(accountsService, 'create').mockResolvedValueOnce(createdAccount);

      const result = await controller.create(createAccountDto);

      expect(result).toEqual(createdAccount);
      expect(accountsService.create).toHaveBeenCalledWith(createAccountDto);
    });
  });
});

