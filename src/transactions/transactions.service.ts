import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcyrpt from "bcrypt";
import { Transaction } from './transactions.schema';
import { AccountsService } from 'src/accounts/accounts.service';
import { UsersService } from 'src/users/users.service';
import { ITransaction, ITransferResponse, TransactionType } from 'src/types';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransactionDto } from './dto/transaction.dto';
import { CreateDepositDto } from './dto/deposit.dto';

@Injectable()
export class TransactionsService {
  /**
   * This module is responsible for managing all transactions that occur in the system.
   * It is used to manage deposits, withdrawals, and transfers between accounts. 
   * It has features that ensure that transactions are atomic and consistent.
   * NOTE: Atomic transactions(Sessions) can only work on a shared replica set!
   * @see [Atomic-Transactions](https://www.mongodb.com/docs/manual/core/write-operations-atomicity/)
   * 
   * It relies on the below modules for efficiency:
   * 
   * @param transactionsModel | This serves as the link to the mongoose entity.
   * 
   * @param cacheManager | Used for caching requests sent to the transactions endpoint to 
   * ensure idepotent request in the transfer and deposit functions.
   * 
   * @param accountService | Used for getting details on a sender and recipient account information.
   * 
   * @param userService | Used when we want to suspend a user's account after 5 failed wrong pin attempts
   */

  constructor(
    @InjectModel(Transaction.name) private transactionsModel: Model<Transaction>,
    // this cache manager would store the cache for the requests

    @Inject(CACHE_MANAGER) private cacheManager: Cache, 
    // avoid circular imports

    @Inject((forwardRef(() => AccountsService))) private accountService: AccountsService,

    private userService: UsersService
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

  private async updatePinFailedAttempts(user_id: string){
    /**
     * This function is invoked everytime a user tries to make a transfer with a wrong pin.
     */

    let count: number = await this.cacheManager.get(user_id) || 0;
    count++;

    await this.cacheManager.set(user_id, count);

    if(count >= 5) {

      // suspend the user's account if the failed attempts is 5 or greater;
      await this.userService.suspendOrEnableUserAccount(user_id, "Maximum No of pin trials exceeded");
      throw new HttpException("You exceed the maximum number of trials. Youre account has been suspended.", HttpStatus.UNAUTHORIZED);
    }
  }

  private async create(transactionDto: TransactionDto, idempotencyKey?: string) {
    /**
     * An internal method to register a new transaction
     * @param transactionDto - The transaction details
     * @param idempotencyKey - (optional) The idempotency key for the transaction
     * @returns The created transaction
     */

    const body = new this.transactionsModel(transactionDto);
    await body.save();

    if (idempotencyKey) {
      // Cache the response for future requests
      await this.cacheResponse(body, idempotencyKey);
    }

    return body;
  }

  async getAllTransactions(): Promise<ITransaction[]> {
    /**
     * Retrieve all transactions
     * @returns All transactions in the system
     */

    return await this.transactionsModel.find();
  }

  async getTransactionsByUser(accountNumber: string): Promise<ITransaction[]> {
    /**
     * Retrieve transactions associated with a user
     * @param accountNumber - The acccount number of the user
     * @returns Transactions associated with the specified user
     */

    return this.transactionsModel.find({
      $or: [{ source: accountNumber }, { destination: accountNumber }],
    });
  }

  async transferFunds(createTransferDto: CreateTransferDto, idempotencyKey?: string): Promise<ITransferResponse> {
    const {source, amount, pin, destination} = createTransferDto;
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

    const response = { source, destination, amount, success: false}
  

    const senderAccount = await this.accountService.findAccountByAccountNumber(source);
    const recipientAccount = await this.accountService.findAccountByAccountNumber(destination);

    if (!senderAccount || !recipientAccount) {
      throw new HttpException('One or both bank accounts do not exist.', HttpStatus.BAD_REQUEST);
    }

    if(source === destination){
      throw new HttpException("Sender and recipient account cannot be the same", HttpStatus.BAD_REQUEST);
    }

    if (senderAccount.balance < amount) {
      throw new HttpException('Insufficient funds in the sender account.', HttpStatus.BAD_REQUEST);
    }

    const isValid = await bcyrpt.compare(pin.toString(), senderAccount.pin);

    if (!isValid) {
        this.updatePinFailedAttempts(senderAccount.owner.id);
        throw new HttpException("Invalid Pin supplied!", HttpStatus.BAD_REQUEST)
    };

    // Perform the transfer
    try {

      const updatedBalance = senderAccount.balance - amount;
      const recipientUpdatedBalance = recipientAccount.balance + amount;

      await this.accountService.updateAccount(senderAccount.accountNumber, { balance: updatedBalance }, session);
      await this.accountService.updateAccount(recipientAccount.accountNumber, { balance: recipientUpdatedBalance }, session);

      await session.commitTransaction();
      session.endSession();

      // register the transaction
      const transactionDto = {...createTransferDto, transactionType: TransactionType.TRANSFER};
      await this.create(transactionDto, idempotencyKey);

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return response
    }

    response.success = true  // modify the response object
    return response
  }

  async depositFunds(createDepositDto: CreateDepositDto, idempotencyKey? : string): Promise<ITransferResponse> {
    /**
     * Deposit funds into an account
     * @param destinationAccountNumber - The account number to deposit funds into
     * @param amount - The amount to deposit
     * @throws HttpException with a status code 400 if the bank account does not exist
     */
    const { destination, amount } = createDepositDto

    const response = { destination, amount, success: false}

    const account = await this.accountService.findAccountByAccountNumber(destination);

    if (!account) {
      throw new HttpException('Bank account does not exist.', HttpStatus.BAD_REQUEST);
    }

    // Perform the deposit
    const session = await this.transactionsModel.startSession();
    session.startTransaction();

    try {
        const updatedBalance = account.balance + amount;
        await this.accountService.updateAccount(account.accountNumber, { balance: updatedBalance });
        
      // register the transaction
      const depositDto = {...createDepositDto, transactionType: TransactionType.DEPOSIT, source: account.accountNumber};
      await this.create(depositDto, idempotencyKey);

    }catch(error){
        await session.abortTransaction();
        session.endSession();
        throw error;
    }

    response.success = true;
    return response

  }

}