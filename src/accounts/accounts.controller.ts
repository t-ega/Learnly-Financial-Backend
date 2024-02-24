import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import * as _ from "lodash";

import { AccountsService } from './accounts.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateAccountDto } from './dto/create-account.dto';
import { AdminGuard } from 'src/guards/isadmin.guard';
import { IRequestPayload } from 'src/types';

@Controller('accounts')
@UseGuards(AuthGuard) // all users must be authenticated before they can access the accounts endpoint
export class AccountsController {

    constructor(private acountsService: AccountsService){}

    @Post()
    async create(@Body() createAccountDto: CreateAccountDto){
        /**
         * @param createAccountDto | An object representing the required fields to be present
         */
        const account = this.acountsService.create(createAccountDto);
        const response = _.pick(account, ['owner',"balance", "accountNumber"]);
        return response;
    }

    @UseGuards(AdminGuard)
    @Get("all")
    async get(){
        const accounts =  await this.acountsService.findAll();
        const response = _.pick(accounts, ['owner',"balance", "accountNumber"]);
        return response;
    }



    @Get("me")
    async getMyAccount(@Req() request : IRequestPayload){
        /**
         * Gets the current user's account details
         */
        const account = await this.acountsService.findAccountByUserId(request.user.id);
        const response = _.pick(account, ['owner',"balance", "accountNumber"]);
        return response;
    }

    @Get("me/transactions")
    async getMyTransactions(@Req() request : IRequestPayload){
        return await this.acountsService.getMyTransactions(request.user.id);
    }

    @UseGuards(AdminGuard)
    @Get(":accountNumber")
    async findAccountByAccountNumber(@Param("accountNumber") accountNumber: string){
        /** 
         * Only admins endpoint 
         * @param accountNumber | The account number of the account to find
         * */
        const account = await this.acountsService.findAccountByAccountNumber(accountNumber);
        const response = _.pick(account, ['owner',"balance", "accountNumber"]);
        return response;
    }

}
