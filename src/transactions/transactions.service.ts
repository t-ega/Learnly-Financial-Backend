import { Model } from 'mongoose';
import * as bcyrpt from "bcrypt";

import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Transaction } from './transactions.schema';
import { UsersService } from '../users/users.service';
import { AccountsService } from '../accounts/accounts.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransactionDto } from './dto/transaction.dto';
import { CreateDepositDto } from './dto/deposit.dto';
import { ITransaction, ITransferResponse, TransactionType } from '../types';
import { MyLoggerService } from '../my-logger/my-logger.service';
import { WithdrawalDto } from './dto/withdrawal.dto';

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

  private readonly logger = new MyLoggerService(TransactionsService.name);

  constructor(
    @InjectModel(Transaction.name) private transactionsModel: Model<Transaction>,
    // this cache manager would store the cache for the requests

    @Inject(CACHE_MANAGER) private cacheManager: Cache, 
    // avoid circular imports

    @Inject((forwardRef(() => AccountsService))) private accountService: AccountsService,

    private userService: UsersService
  ) {}

  async cacheResponse(idempotencyKey: string, body: Transaction,) {
    /**
     * Cache the response of a transaction for future requests
     * @param body - The transaction body to be cached and returnd in subsequent requests.
     * @param idempotencyKey - The idempotency key for the transaction
     */

    await this.cacheManager.set(idempotencyKey, body, 86400000); // cache for a day in milliseconds
  }

  private async updatePinFailedAttempts(user_id: string): Promise<number>{
    /**
     * This function is invoked everytime a user tries to make a transfer with a wrong pin.
     */

    let count: number = await this.cacheManager.get(user_id) || 0;
    count++;

    await this.cacheManager.set(user_id, count, 3600); // cache for an hour

    if(count >= 5) {

      // suspend the user's account if the failed attempts is 5 or greater;
      await this.userService.suspendUserAccount(user_id, "Maximum No of pin trials exceeded");
      }

    return count;
  }

  private async createTransaction(transactionDto: TransactionDto, idempotencyKey?: string) {
    /**
     * An internal method to register a new transaction
     * @param transactionDto - The transaction details
     * @param idempotencyKey - (optional) The idempotency key for the transaction
     * @returns The created transaction
     */

    const body = await this.transactionsModel.create(transactionDto);
    await body.save();

    if (idempotencyKey) {
      // Cache the response for future requests
      await this.cacheResponse(idempotencyKey, body);
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

  async transferFunds(req_user_id: string, createTransferDto: CreateTransferDto, idempotencyKey?: string): Promise<ITransferResponse> {

    /**
     * Transfer funds between two accounts
     * @param senderAccountNumber - The account number of the sender
     * @param recipientAccountNumber - The account number of the recipient
     * @param amount - The amount to transfer
     * @throws HttpException with a status code 400 if one or both bank accounts do not exist,
     *  or if there are insufficient funds in the sender account
    */
   
   const {source, amount, pin, destination} = createTransferDto;
    // enusuring atomicity
    const session = await this.transactionsModel.startSession();
    session.startTransaction();

    const response = { source, destination, amount, success: false}


    const senderAccount = await this.accountService.findAccountByAccountNumber(source);
    const recipientAccount = await this.accountService.findAccountByAccountNumber(destination);

    if(amount <= 0) throw new HttpException("Invalid amount", HttpStatus.BAD_REQUEST);

    if (!senderAccount || !recipientAccount) {
      throw new HttpException('One or both bank accounts do not exist.', HttpStatus.BAD_REQUEST);
    }

    if(senderAccount.owner.id !== req_user_id){
      throw new HttpException("You are not allowed to transfer from this account", HttpStatus.BAD_REQUEST);
    }

    if(source === destination){
      throw new HttpException("Sender and recipient account cannot be the same", HttpStatus.BAD_REQUEST);
    }

    if (senderAccount.balance < amount) {
      throw new HttpException('Insufficient funds in the sender account.', HttpStatus.BAD_REQUEST);
    }

    const isValid = await bcyrpt.compare(pin.toString(), senderAccount.pin);

    if (!isValid) {
        const trials = await this.updatePinFailedAttempts(senderAccount.owner.id);

        if(trials >= 5) {
          throw new HttpException("Maximum No of pin trials exceeded", HttpStatus.BAD_REQUEST);
        }
        else{
          throw new HttpException("Invalid Pin supplied!", HttpStatus.BAD_REQUEST)
        }

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
      await this.createTransaction(transactionDto, idempotencyKey);

    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      // log the error
      const entry = `TRANSFER ERROR: FAILED TO EXECUTE TRANSFER FOR ${senderAccount.accountNumber} to ${recipientAccount.accountNumber}`;
      this.logger.error(entry, error);

      throw error;
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
      await this.createTransaction(depositDto, idempotencyKey);

    }catch(error){
        await session.abortTransaction();
        session.endSession();
        // log the error
        const entry = `DEPOSIT ERROR: FAILED TO EXECUTE DEPOSIT FOR ${account.accountNumber}`;
        this.logger.error(entry, error);
        throw error;
    }

    response.success = true;
    return response

  }

  async withdrawFunds(withdrawalDto: WithdrawalDto, idempotencyKey?: string): Promise<ITransferResponse> {
    /**
     * Note: The money deducted from the account does not go anywhere, it is just removed from the account.
     * Withdraw funds from an account
     * @param accountNumber - The account number to withdraw funds from
     * @param amount - The amount to withdraw
     * @throws HttpException with a status code 400 if the bank account does not exist
     * or if there are insufficient funds in the account
     */

    const { source, destination, amount, pin, destinationBankName } = withdrawalDto;
    const response = { destination, amount, destinationBankName,  success: false}

    const sourceAccount = await this.accountService.findAccountByAccountNumber(source);

    if (!sourceAccount) {
      throw new HttpException('Source Bank account does not exist.', HttpStatus.BAD_REQUEST);
    }

    if (sourceAccount.balance < amount) {
      throw new HttpException('Insufficient funds in the account.', HttpStatus.BAD_REQUEST);
    }

    const isValid = await bcyrpt.compare(pin.toString(), sourceAccount.pin);

    if (!isValid) {
        const trials = await this.updatePinFailedAttempts(sourceAccount.owner.id);

        if(trials >= 5) {
          throw new HttpException("Maximum No of pin trials exceeded", HttpStatus.BAD_REQUEST);
        }
        else{
          throw new HttpException("Invalid Pin supplied!", HttpStatus.BAD_REQUEST)
        }

    };

    // Perform the withdrawal
    const session = await this.transactionsModel.startSession();
    session.startTransaction();

    try {
      const updatedBalance = sourceAccount.balance - amount;
      await this.accountService.updateAccount(sourceAccount.accountNumber, { balance: updatedBalance });
      
      // register the transaction
      const transactionDto = { source: sourceAccount.accountNumber, destination: sourceAccount.accountNumber, amount, transactionType: TransactionType.WITHDRAWAL};
      await this.createTransaction(transactionDto, idempotencyKey);

    }catch(error){
        await session.abortTransaction();
        session.endSession();
        // log the error
        const entry = `WITHDRAWAL ERROR: FAILED TO EXECUTE WITHDRAWAL FOR ${sourceAccount.accountNumber}`;
        this.logger.error(entry, error);
        throw error;
    }

    response.success = true;
    return response
  }


}