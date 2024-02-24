import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/isadmin.guard';
import { Transaction } from './transactions.schema';
import { TransactionsService } from './transactions.service';
import { IRequestPayload } from 'src/types';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateDepositDto } from './dto/deposit.dto';

@UseGuards(AuthGuard) // all users must be authenticated to use this endpoint
@Controller('transactions')
export class TransactionsController {

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
        return await this.transactionService.transferFunds(createTransferDto, idempotencyKey);
    }

    @Post("deposit")
    async deposit(@Body() createDepositDto: CreateDepositDto, @Req() req: IRequestPayload){
        const idempotencyKey = req.headers['idempotency-key']?.[0];
        return await this.transactionService.depositFunds(createDepositDto, idempotencyKey);
    }

    
}
