import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { IRequestPayload, Transaction } from 'src/types';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: {
            getAllTransactions: jest.fn(),
            getOne: jest.fn(),
            transferFunds: jest.fn(),
            depositFunds: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllTransactions', () => {
    it('should return all transactions', async () => {
      const mockTransactions: Transaction[] = [{}, {}] as Transaction[];
      jest.spyOn(service, 'getAllTransactions').mockResolvedValue(mockTransactions);

      const result = await controller.getAllTransactions();

      expect(result).toEqual(mockTransactions);
    });
  });

  describe('getMyTransactions', () => {
    it('should return transactions associated with the user', async () => {
      const mockUserPayload: IRequestPayload = { user: { id: '123' } };
      const mockTransactions: Transaction[] = [{}, {}] as Transaction[];
      jest.spyOn(service, 'getOne').mockResolvedValue(mockTransactions);

      const result = await controller.getMyTransactions(mockUserPayload);

      expect(result).toEqual(mockTransactions);
      expect(service.getOne).toHaveBeenCalledWith(mockUserPayload.user.id);
    });
  });

  describe('transfer', () => {
    it('should transfer funds and log the transaction', async () => {
      const mockRequestPayload: IRequestPayload = { headers: { 'idempotency-key': ['123'] } } as IRequestPayload;
      const mockCreateTransferDto = {};
      const mockResponse = { destination: 'destination', source: 'source', amount: 100, success: true };
      jest.spyOn(service, 'transferFunds').mockResolvedValue(mockResponse);
      const loggerSpy = jest.spyOn(controller['logger'], 'log');

      const result = await controller.transfer(mockCreateTransferDto, mockRequestPayload);

      expect(result).toEqual(mockResponse);
      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  describe('deposit', () => {
    it('should deposit funds and log the transaction', async () => {
      const mockRequestPayload: IRequestPayload = { headers: { 'idempotency-key': ['123'] } } as IRequestPayload;
      const mockCreateDepositDto = {};
      const mockResponse = { destination: 'destination', amount: 100, success: true };
      jest.spyOn(service, 'depositFunds').mockResolvedValue(mockResponse);
      const loggerSpy = jest.spyOn(controller['logger'], 'log');

      const result = await controller.deposit(mockCreateDepositDto, mockRequestPayload);

      expect(result).toEqual(mockResponse);
      expect(loggerSpy).toHaveBeenCalled();
    });
  });
});
