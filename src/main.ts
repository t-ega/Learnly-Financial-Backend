import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { MyLoggerService } from './my-logger/my-logger.service';
import * as corsOption from './config/corsOption';
import { AppModule } from './app.module';


async function bootstrap() {
  /**   
   * We are using Global pipes so that every endpoint should be 
   * validated according to the validation rule set in the dto.
   * @see [Validation](https://docs.nestjs.com/techniques/validation#auto-validation)
   * 
   * Using hemlmet a third party library to protect the app by setting various HTTP headers.
   * @see [Helmet](https://www.npmjs.com/package/helmet)
   * 
   * We are using cors to enable cross-origin resource sharing.
   * @see [CORS](https://www.npmjs.com/package/cors)
   * 
   * This resource is protected by the ThrottlerGuard, which is a rate limiter.
   * It helps to protect the app from abuse and can be used to protect against brute force attacks.
   * @see [Throttling](https://docs.nestjs.com/security/rate-limiting)
  **/

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  // exception handler
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.enableCors(corsOption);
  
  // overide the default logging module 
  app.useLogger(new MyLoggerService());

  // protect the app by setting various HTTP headers
  app.use(helmet());

  // when more features are added, for backwards compatibility we can go with v2/api
  app.setGlobalPrefix("/v1/api");


  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);
}
bootstrap();
