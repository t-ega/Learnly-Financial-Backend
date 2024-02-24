import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './transactions.schema';
import { Model } from 'mongoose';
import { AccountsService } from 'src/accounts/accounts.service';
import { TransactionDto } from './dto/transaction.dto';

@Injectable()
export class TransactionsService {

  constructor(
    @InjectModel(Transaction.name) private transactionsModel: Model<Transaction>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private accountService: AccountsService,
  ) {}

  async cacheResponse(body: Transaction, idempotencyKey: string) {
    /**
     * Cache the response of a transaction for future requests
     * @param body - The transaction body to be cached and returnd in subsequent requests.
     * @param idempotencyKey - The idempotency key for the transaction
     */
    const idempotentObject = { idempotencyKey, body };
    await this.cacheManager.set(idempotencyKey, idempotentObject, 86400000); // cache for a day in milliseconds
  }

  async create(transactionDto: TransactionDto, idempotencyKey?: string): Promise<Transaction> {
    /**
     * Create a new transaction
     * @param transactionDto - The transaction details
     * @param idempotencyKey - (optional) The idempotency key for the transaction
     * @returns The created transaction
     */
    const body = await this.transactionsModel.create(transactionDto);

    if (idempotencyKey) {
      // Cache the response for future requests
      await this.cacheResponse(body, idempotencyKey);
    }

    return body;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    /**
     * Retrieve all transactions
     * @returns All transactions in the system
     */
    return await this.transactionsModel.find();
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    /**
     * Retrieve transactions associated with a user
     * @param userId - The ID of the user
     * @returns Transactions associated with the specified user
     */
    return this.transactionsModel.find({
      $or: [{ source: userId }, { destination: userId }],
    });
  }

  async transferFunds(senderAccountNumber: number, recipientAccountNumber: number, amount: number): Promise<void> {
    /**
     * Transfer funds between two accounts
     * @param senderAccountNumber - The account number of the sender
     * @param recipientAccountNumber - The account number of the recipient
     * @param amount - The amount to transfer
     * @throws HttpException with a status code 400 if one or both bank accounts do not exist,
     *  or if there are insufficient funds in the sender account
     */
    // enusuring atomicity
    const session = await this.transactionsModel.startSession();
    session.startTransaction();

    try {
      const senderAccount = await this.accountService.findOne(senderAccountNumber);
      const recipientAccount = await this.accountService.findOne(recipientAccountNumber);

      if (!senderAccount || !recipientAccount) {
        throw new HttpException('One or both bank accounts do not exist.', HttpStatus.BAD_REQUEST);
      }

      if (senderAccount.balance < amount) {
        throw new HttpException('Insufficient funds in the sender account.', HttpStatus.BAD_REQUEST);
      }

      // Perform the transfer
      const updatedBalance = senderAccount.balance - amount;
      const recipientUpdatedBalance = recipientAccount.balance + amount;

    await this.accountService.updateAccount(senderAccount.accountNumber, { balance: updatedBalance }, session);
    await this.accountService.updateAccount(recipientAccount.accountNumber, { balance: recipientUpdatedBalance }, session);

    await session.commitTransaction();
    session.endSession();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async depositFunds(destinationAccountNumber: number, amount: number): Promise<void> {
    /**
     * Deposit funds into an account
     * @param destinationAccountNumber - The account number to deposit funds into
     * @param amount - The amount to deposit
     * @throws HttpException with a status code 400 if the bank account does not exist
     */
    const account = await this.accountService.findOne(destinationAccountNumber);

    if (!account) {
      throw new HttpException('Bank account does not exist.', HttpStatus.BAD_REQUEST);
    }

    // Perform the deposit
    const session = await this.transactionsModel.startSession();
    session.startTransaction();

    try {
        const updatedBalance = account.balance + amount;
        await this.accountService.updateAccount(account.accountNumber, { balance: updatedBalance }, session);
    }catch(error){
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
  }
}