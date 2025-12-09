import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChatModule } from './chat/chat.module';
import { ChatBoxesModule } from './chat-boxes/chat-boxes.module';
import { AIModule } from './ai/ai.module';
import { GroupsModule } from './groups/groups.module';
import { UsersModule } from './users/users.module';
import { DiariesModule } from './diaries/diaries.module';

@Module({
  imports: [AuthModule, PrismaModule, ChatModule, ChatBoxesModule, AIModule, GroupsModule, UsersModule, DiariesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
