import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MyLoggerService } from './my-logger/my-logger.service';


async function bootstrap() {
  /**   
   * We are using Global pipes so that every endpoint should be 
   * validated according to the validation rule set in the dto.
   * @see [Validation](https://docs.nestjs.com/techniques/validation#auto-validation)
  **/

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });
  
  // overide the default logging module 
  app.useLogger(new MyLoggerService());

  // when more features are added, for backwards compatibility we can go with v2/api
  app.setGlobalPrefix("/v1/api");

  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);
}
bootstrap();