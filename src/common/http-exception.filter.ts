import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const res = exception.getResponse() as { message: string[] };

    const message = res?.message?.join ? res?.message?.join(',') : exception.message;
    response.status(200).json({
      code: status,
      message,
      data: {},
      success: false,
    });
  }
}
