import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 100000,
        maxRedirects: 5,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
    PrismaModule,
  ],

  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule { }
