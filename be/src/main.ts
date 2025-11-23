import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      transform: true, 
      forbidNonWhitelisted: true, 
    }),
  );

  app.useWebSocketAdapter(new IoAdapter(app)); 

  app.enableCors({
    // Trong môi trường development, '*' cho phép mọi origin.
    // Trong PRODUCTION, bạn NÊN thay thế '*' bằng URL chính xác của frontend của bạn
    // Ví dụ: origin: ['http://localhost:8080', 'https://your-frontend.com']
    origin: '*', 
    credentials: true, // Cho phép truyền cookies, Authorization headers, v.v.
  });

  // Lấy cổng từ biến môi trường PORT, nếu không có thì dùng 3000
  const port = process.env.PORT || 3000; 
  await app.listen(port);
  
  // Log thông tin khi ứng dụng khởi động thành công
  console.log(`Application (HTTP API) is running on: ${await app.getUrl()}`);
  console.log(`WebSocket (Socket.IO) is listening on namespace /chat at ${await app.getUrl()}/chat`);
}
bootstrap();
