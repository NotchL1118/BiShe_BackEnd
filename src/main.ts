import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { CommonResInterceptor } from './common/common-res.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new CommonResInterceptor()); // 统一的返回格式
  app.useGlobalFilters(new HttpExceptionFilter()); // 统一的错误处理
  app.useGlobalPipes(new ValidationPipe()); // 参数校验
  await app.listen(3000);
}
bootstrap();
