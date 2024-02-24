import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import * as bcrypt from "bcrypt";

// internal packages
import { Account } from './account.schema';
import { Transaction } from 'src/transactions/transactions.schema';
import { TransactionsService } from 'src/transactions/transactions.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CreateAccountDto } from './dto/create-account.dto';


@Injectable()
export class AccountsService {
    constructor(
    @InjectModel(Account.name) private accountModel :  Model<Account>,
    @Inject((forwardRef(() => TransactionsService)))private transactionService: TransactionsService
    ) {}

    async create(createAccountDto: CreateAccountDto) : Promise<Account>{
        const { pin, ...values} = createAccountDto;

        // hash pin before saving
        const saltRounds = 10;
        const hashedPin = await bcrypt.hash(pin.toString(), saltRounds);

        const accountNumber = this.generateAccountNumber();

        // check if an account already exits before creating
        const userAccount = await this.accountModel.findOne({owner: createAccountDto.owner});
        if (userAccount) return userAccount

        const user = new this.accountModel({pin: hashedPin, accountNumber, ...values});
        await user.save();
        return user;
    }

    async findAll() : Promise<Account[]>{
        /** 
         * Note: This service should be only called by admins.
         * */ 
        return await this.accountModel.find();
    
    }

    async findAccountByAccountNumber(accountNumber: string): Promise<Account>{
        /**
         * Find an account by the associated account Number
         */
        const account = await this.accountModel.findOne({accountNumber});
        return account
    }

    async findAccountByUserId(owner_id: string) : Promise<Account> {
        /**
         * Find and return a users account based on the owner
         */
        const account = await this.accountModel.findOne({owner: owner_id});
        return account
    }

    async updateAccount(accountNumber: string, updateAccountDto: UpdateAccountDto, session: ClientSession) : Promise<Account>{
        // pass in the session in order to maintain atomicity during updates
        const account = await this.accountModel.findOneAndUpdate({accountNumber}, updateAccountDto, {new: true, session});
        return account
    }

    async getMyTransactions(id: string): Promise <Transaction[]>{       
        return this.transactionService.getTransactionsByUser(id)
    }

    private generateAccountNumber(): string {
       /**
        * In the internal systems every account number 
        * must start with `21`
        */
        let randomNumber = Math.floor(Math.random() * 90000000) + 10000000;
        // every account number is prefixed with a 21
        return "21" + randomNumber.toString();
      }
}
