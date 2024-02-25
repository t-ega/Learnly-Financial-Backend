import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { IRequestPayload, UserRoles } from 'src/types';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateDepositDto } from './dto/deposit.dto';

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
            getAllTransactions: jest.fn(),
            getMyTransactions: jest.fn(),
            transfer: jest.fn(),
            deposit: jest.fn(),
          },
        },
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

      const mockRequestPayload: Partial<IRequestPayload> = {
        user: {
            id: 'mockUserId',
            role: UserRoles.REGULAR,
        },
        headers: { 'idempotency-key': '123' },
    };
    
    const finalMockRequestPayload: IRequestPayload = mockRequestPayload as IRequestPayload;

      const mockResponse = { 
        success: true,
        source: 'sourceAccountNumber',
        destination: 'destinationAccountNumber',
        amount: 100,
       };

      jest.spyOn(transactionsService, 'transferFunds').mockResolvedValueOnce(mockResponse);

      const result = await controller.transfer(mockCreateTransferDto, finalMockRequestPayload);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('deposit', () => {
    it('should deposit funds successfully', async () => {

      const mockCreateDepositDto: CreateDepositDto = {
        destination: 'destinationAccountNumber',
        amount: 100,
      };

      const mockRequestPayload: Partial<IRequestPayload> = {
        user: {
            id: 'mockUserId',
            role: UserRoles.REGULAR,
        },
        headers: { 'idempotency-key': '123' },
    };
    
    const finalMockRequestPayload: IRequestPayload = mockRequestPayload as IRequestPayload;

      const mockResponse = { success: true, destination: 'destinationAccountNumber', amount: 100, };
      jest.spyOn(transactionsService, 'depositFunds').mockResolvedValueOnce(mockResponse);

      const result = await controller.deposit(mockCreateDepositDto, finalMockRequestPayload);

      expect(result).toEqual(mockResponse);
    });
  });

});
