import { Module, forwardRef } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './transactions.schema';
import { AccountsModule } from '../accounts/accounts.module';
import { UsersModule } from '../users/users.module';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [
    UsersModule,
    CacheModule.register(),
    // there is a cicular dependency between the transactions module and accounts module
    forwardRef(() => AccountsModule),
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }])
  ],
  providers: [
    TransactionsService
  ],
  controllers: [TransactionsController],
  exports: [TransactionsService]
})
export class TransactionsModule {}
