import { Module, forwardRef } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { UsersModule } from 'src/users/users.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './account.schema';

@Module({
    imports: [
      UsersModule, 
      // there is a cicular dependency between the transactions module and accounts module
      forwardRef(() => TransactionsModule), 
      MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }])
    ],
  providers: [AccountsService],
  controllers: [AccountsController],
  exports: [AccountsService]
})
export class AccountsModule {}
