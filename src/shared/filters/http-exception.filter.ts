import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    console.log(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    try {
      let { statusCode, message, error } = exception.getResponse() as any;
      message = typeof message === 'string' ? message : message.join(',');

      return response.status(statusCode).json({
        status_code: statusCode,
        message: message,
        error: [error],
        data: null,
      });
    } catch (error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to process the request',
        error: [exception.message],
        data: null,
      });
    }
  }
}
