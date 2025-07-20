import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something Went Wrong';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      // Only use the exception's message for non-500 errors
      message = status === HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Something Went Wrong'
        : exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}