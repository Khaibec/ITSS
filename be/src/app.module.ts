import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ChatBoxesModule } from './chat-boxes/chat-boxes.module';

@Module({
  imports: [PrismaModule, ChatBoxesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
