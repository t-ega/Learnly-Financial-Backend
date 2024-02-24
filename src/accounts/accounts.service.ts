import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account } from './account.schema';
import { ClientSession, Model } from 'mongoose';
import { Transaction } from 'src/transactions/transactions.schema';
import { TransactionsService } from 'src/transactions/transactions.service';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
    constructor(
        @InjectModel(Account.name) private accountModel :  Model<Account>,
    private transactionService: TransactionsService) {}

    async create(){}

    async findAll(){
        /** 
         * Note: This service should be only called by admins.
         * */ 
        return await this.accountModel.find();
    }

    async findOne(accountNumber: number): Promise<Account>{
        /**
         * Find an account by the associated account Number
         */
        return await this.accountModel.findOne({accountNumber})
    }

    async getMyTransactions(id: string): Promise <Transaction[]>{       
        return this.transactionService.getAllTransactions()
    }

    async updateAccount(accountNumber: string, updateAccountDto: UpdateAccountDto, session: ClientSession){
        // pass in the session in order to maintain atomicity during updates
        return await this.accountModel.findOneAndUpdate({accountNumber}, updateAccountDto, {new: true, session});
    }
}
