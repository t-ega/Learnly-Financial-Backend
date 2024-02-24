import { Controller, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/isadmin.guard';
import { Transaction } from './transactions.schema';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {

    constructor(private transactionService : TransactionsService){}

    @UseGuards(AuthGuard, AdminGuard)
    async getAllTransactions() : Promise <Transaction[]>{
        return await this.transactionService.getAllTransactions();
    }

    @UseGuards(AuthGuard)
    async getMyTransactions(@Req() request): Promise <Transaction[]>{    
       return await this.transactionService.getTransactionsByUser(request.user?.id);
    }
}
