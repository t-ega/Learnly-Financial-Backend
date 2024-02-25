import { Catch, ArgumentsHost, HttpStatus, HttpException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Request, Response } from 'express' 
import { MyLoggerService } from "./my-logger/my-logger.service";
import { MyErrorResponseObj } from "./types";


/**
 * Custom exception filter that catches all exceptions thrown within the application
 */
@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  /**
   * Exception filter for handling internal error messages
   * @see [Exception-filters](https://docs.nestjs.com/exception-filters)
   */
  private readonly logger = new MyLoggerService(AllExceptionsFilter.name);

  /**
   * Handles the caught exception and sends an appropriate error response
   * @param exception The caught exception
   * @param host ArgumentsHost object containing the request and response objects
   */
  catch(exception: unknown, host: ArgumentsHost) {
    // Extract the request and response objects from ArgumentsHost
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Prepare the response object with default values
    const myResponseObj: MyErrorResponseObj = {
      statusCode: 500, // default status code
      timestamp: new Date().toISOString(),
      path: request.url,
      response: '',
    };

    // Handle known HTTP exceptions
    if (exception instanceof HttpException) {
      myResponseObj.statusCode = exception.getStatus();
      myResponseObj.response = exception.getResponse();
    }
    // Handle unknown exceptions
    else {
      myResponseObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      myResponseObj.response = 'Internal Server Error';
    }

    // Send the response with the appropriate status code and error message
    response.status(myResponseObj.statusCode).json(myResponseObj);

    // Log the error message
    this.logger.error(myResponseObj.response, AllExceptionsFilter.name);

    // Call the parent class's catch method to continue handling the exception
    super.catch(exception, host);
  }
}