import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { UsersService } from 'src/users/users.service';

@Module({
    imports: [UsersService],
  providers: [AccountsService],
  controllers: [AccountsController]
})
export class AccountsModule {}
