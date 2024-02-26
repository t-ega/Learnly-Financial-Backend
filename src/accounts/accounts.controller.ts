import { Body, Controller, Get, Ip, Param, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import * as _ from "lodash";

import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/isadmin.guard';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { IRequestPayload } from '../types';
import { MyLoggerService } from '../my-logger/my-logger.service';
import { UsersTransformInterceptor } from '../interceptors/users.transfrom.interceptor';

@Controller('accounts')
@UseGuards(AuthGuard) // all users must be authenticated before they can access the accounts endpoint
export class AccountsController {

    /**
     * This controller is used to manage user accounts, 
     * including the ability to create new accounts, 
     * retrieve account details, and list transactions associated with a specific account.
     * 
     * It enables `MONITORING` features like logging when ever a request is made to admin specific endpoints like
     * getallusersaccount, find a user by their account number.
     * 
     * Note: Methods like updating/deleting a user's account details are not implemented here.
     * @param acountsService Service for the controller
     */

    private readonly logger = new MyLoggerService(AccountsController.name);
    constructor(private acountsService: AccountsService){}

    @UseInterceptors(UsersTransformInterceptor)
    @Post()
    async create(@Body() createAccountDto: CreateAccountDto){
        /**
         * @param createAccountDto | An object representing the required fields to be present
         */
        const account = await this.acountsService.create(createAccountDto);
        return account;
    }

    @UseGuards(AdminGuard)
    @Get("all")
    async get(@Ip() ip: string){
        /**
         * Only admins can access this endpoint
         */

        // log request that a user requested users account
        this.logger.log(`Request for ALL USERS ACCOUNT\t${ip}`);

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
        /**
         *  Get all transactions for that particular user
         */
        return await this.acountsService.getMyTransactions(request.user.id);
    }

    @UseGuards(AdminGuard)
    @Get(":accountNumber")
    async findAccountByAccountNumber(@Ip() ip: string, @Param("accountNumber") accountNumber: string){
        /** 
         * Only admins endpoint 
         * @param accountNumber | The account number of the account to find
         * */

        // log request that a user requested users account
        this.logger.log(`Request for ALL USERS ACCOUNT\t${ip}`)

        const account = await this.acountsService.findAccountByAccountNumber(accountNumber);
        const response = _.pick(account, ['owner',"balance", "accountNumber"]);
        return response;
    }

}
