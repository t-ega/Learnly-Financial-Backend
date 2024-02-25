import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { MyLoggerService } from '../my-logger/my-logger.service';
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/isadmin.guard';
import { Transaction } from './transactions.schema';

import { TransactionsService } from './transactions.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateDepositDto } from './dto/deposit.dto';
import { IRequestPayload } from '../types';

@UseGuards(AuthGuard) // all users must be authenticated to use this endpoint
@Controller('transactions')
export class TransactionsController {
    /** This controller various enables types of transactions, including deposits, 
     * withdrawals, and transfers between accounts.
     * It enables `MONITORING` features like logging when ever a transaction(deposit/transfer) is made.
     * @param transactionService 
     */

    private readonly logger = new MyLoggerService(TransactionsController.name);
    constructor(private transactionService : TransactionsService){}

    @UseGuards(AdminGuard)
    @Get()
    async getAllTransactions() : Promise <Transaction[]>{
        /**
         * Admin endpoint to get all the transactions of this object
         */
        return await this.transactionService.getAllTransactions();
    }

    @Get("me")
    async getMyTransactions(@Req() request : IRequestPayload): Promise <Transaction[]>{    
       return await this.transactionService.getTransactionsByUser(request.user?.id);
    }

    @Post("transfer")
    async transfer(@Body() createTransferDto: CreateTransferDto, @Req() req: IRequestPayload){
        const idempotencyKey = req.headers['idempotency-key']?.[0];
        const response = await this.transactionService.transferFunds(createTransferDto, idempotencyKey);
        this.logger.log(`Transfer executed for:\t${response.destination}\tFROM: ${response.source}\t Success: ${response.success}`);
        return response;
    }

    @Post("deposit")
    async deposit(@Body() createDepositDto: CreateDepositDto, @Req() req: IRequestPayload){
        const idempotencyKey = req.headers['idempotency-key']?.[0];
        const response = await this.transactionService.depositFunds(createDepositDto, idempotencyKey);
        
        this.logger.log(`Deposit made for:\t${response.destination}\tSuccess: ${response.success}`);
        return response;
    }

    
}
