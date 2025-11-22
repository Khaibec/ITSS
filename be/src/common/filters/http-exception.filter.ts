import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: object | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        // Chỉ trả về error object nếu không phải production hoặc không chứa thông tin nhạy cảm
        if (process.env.NODE_ENV !== 'production') {
          error = responseObj;
        } else {
          // Trong production, chỉ trả về error object nếu không có stack trace
          const { stack, ...safeError } = responseObj;
          error = Object.keys(safeError).length > 0 ? safeError : undefined;
        }
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      // Trong production, không trả về error object cho non-HTTP exceptions
      if (process.env.NODE_ENV !== 'production') {
        error = {
          name: exception.name,
          message: exception.message,
        };
      }
    }

    const errorResponse = {
      success: false,
      message,
      ...(error && { error }),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}

