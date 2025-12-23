
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

    // 一覧取得：ユーザー自身の学習日記を新しい順で返す（タイトルと学習日とIDのみ）
    async listEntries(userId: number) {
        const diaries = await this.prisma.learning_diaries.findMany({
            where: { user_id: userId },
            select: {
                diary_id: true,
                title: true,
                learning_date: true,
            },
            orderBy: { learning_date: 'desc' },
        });

        return { success: true, data: diaries };
    }

    // 詳細取得：ユーザー自身のレコードのみ返す
    async getEntryById(userId: number, diaryId: number) {
        const diary = await this.prisma.learning_diaries.findFirst({
            where: { diary_id: diaryId, user_id: userId },
            select: {
                diary_id: true,
                title: true,
                learning_date: true,
                situation: true,
                learning_content: true,
                created_at: true,
            },
        });

        if (!diary) {
            return { success: false, message: '学習日記が見つかりません。' };
        }

        // 参照履歴の保存（任意）：存在しない場合のみ作成
        await this.prisma.diary_views.upsert({
            where: { diary_id_user_id: { diary_id: diaryId, user_id: userId } },
            update: { viewed_at: new Date() },
            create: { diary_id: diaryId, user_id: userId, viewed_at: new Date() },
        });

        return { success: true, data: diary };
    }
}
