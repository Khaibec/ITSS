
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiariesService {
    constructor(private prisma: PrismaService) { }

    async createEntry(userId: number, data: { original: string; warning?: string; suggestion?: string }) {
        return this.prisma.learning_diaries.create({
            data: {
                user_id: userId,
                learning_content: `[Review Result]\nOriginal: ${data.original}\nWarning: ${data.warning || 'None'}\nSuggestion: ${data.suggestion || 'None'}`,
                situation: 'Chat Message Review',
                title: `Review - ${new Date().toLocaleDateString()}`
            }
        });
    }
}
