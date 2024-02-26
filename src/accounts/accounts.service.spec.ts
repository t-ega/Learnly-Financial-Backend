import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './account.schema';
import { IAccount, UserRoles } from '../types';


describe('AccountsService', () => {
  let service: AccountsService;
  let accountModel: Model<Account>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AccountsService,
          useValue: {
            create: jest.fn(),
          },
        }
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  describe('create', () => {
    it('should create a new account', async () => {
      const createAccountDto: CreateAccountDto = {
        owner: 'John Doe',
        pin: 1234,
      };

      const createdAccount = {
        owner: {
          id: '232943895ff435678cd',
          role: UserRoles.REGULAR,
        },
        accountNumber: '1234567890',
        balance: 0,
      } as IAccount;

      jest.spyOn(service, 'create').mockResolvedValueOnce(createdAccount);

      const result = await service.create(createAccountDto);

      expect(result).toEqual(expect.objectContaining(createdAccount));
    });


  });

});
