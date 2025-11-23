import { Module } from '@nestjs/common';
import { ChatBoxesController } from './chat-boxes.controller';
import { ChatBoxesService } from './chat-boxes.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChatBoxesController],
  providers: [ChatBoxesService],
  exports: [ChatBoxesService],
})
export class ChatBoxesModule {}

