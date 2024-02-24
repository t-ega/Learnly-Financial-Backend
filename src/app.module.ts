import {Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import {ThrottlerGuard, ThrottlerModule} from "@nestjs/throttler"
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { MyLoggerModule } from './my-logger/my-logger.module';

/**
 * For this module, Set the throttler timeToLive(ttl) to 1 secs in order to 
 * enforce rate limiting on our api endpoints
 * @see [Throttling]()
 */
@Module({
  imports: [
    ConfigModule.forRoot({}),
    UsersModule, 
    MongooseModule.forRoot(process.env.MONGODB_URI),
    ThrottlerModule.forRoot([{
      ttl: 1000,
      limit: 3
    }]),
    AuthModule,
    AccountsModule,
    TransactionsModule,
    MyLoggerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    {
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }
  ],
  exports: [ConfigModule.forRoot({})]
})

export class AppModule {}
