import { Module, forwardRef } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './transactions.schema';
import { AccountsModule } from 'src/accounts/accounts.module';

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
