import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, HydratedDocument, Model } from 'mongoose';
import * as bcrypt from "bcrypt";

// internal packages
import { Account } from './account.schema';
import { TransactionsService } from '../transactions/transactions.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { IAccount, ITransaction } from '../types';


@Injectable()
export class AccountsService {

    /**
     * This service is used to manage user accounts, 
     * including the ability to create new accounts, 
     * retrieve account details, and list transactions associated with a specific account.
     * @param accountModel The accounts model
     * @param transactionService The transactions service
     */
    
    constructor(
    @InjectModel(Account.name) private accountModel :  Model<Account>,
    @Inject((forwardRef(() => TransactionsService)))private transactionService: TransactionsService
    ) {}

    async create(createAccountDto: CreateAccountDto) : Promise<IAccount>{
        const { pin, ...values} = createAccountDto;

        // hash pin before saving
        const saltRounds = 10;
        const hashedPin = await bcrypt.hash(pin.toString(), saltRounds);

        const accountNumber = this.generateAccountNumber();

        // check if an account already exits before creating
        const userAccount: HydratedDocument<IAccount> = await this.accountModel.findOne({owner: createAccountDto.owner});
        if (userAccount) return userAccount

        const user: HydratedDocument<IAccount> = await this.accountModel.create({pin: hashedPin, accountNumber, ...values});
        await user.save();
        return user;
    }

    async findAll() : Promise<IAccount[]>{
        /** 
         * Note: This service should be only called by admins.
         * */ 
        return await this.accountModel.find();
    
    }

    async findAccountByAccountNumber(accountNumber: string): Promise<IAccount>{
        /**
         * Find an account by the associated account Number.
         * Note: HydratedDocument<IUser> represents a hydrated Mongoose document,
         *  with methods, virtuals, and other Mongoose-specific features.
         * 
         * @see [HydratedDocument](https://mongoosejs.com/docs/typescript.html)
         */
        
        const account: HydratedDocument<IAccount> = await this.accountModel.findOne({accountNumber}).populate('owner');
        return account;
    }

    async findAccountByUserId(owner_id: string) : Promise<IAccount> {
        /**
         * Find and return a users account based on the owner
         */
        const account : HydratedDocument<IAccount> = await this.accountModel.findOne({owner: owner_id});
        return account
    }

    async updateAccount(accountNumber: string, updateAccountDto: UpdateAccountDto, session?: ClientSession) : Promise<IAccount>{
        // pass in the session in order to maintain atomicity during updates
        const account : HydratedDocument<IAccount> = await this.accountModel.findOneAndUpdate({accountNumber}, updateAccountDto, {new: true, session});
        return account;
    }

    async getMyTransactions(id: string): Promise <ITransaction[]>{     
        const account = await this.findAccountByUserId(id); 
        return this.transactionService.getTransactionsByUser(account.accountNumber);
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
