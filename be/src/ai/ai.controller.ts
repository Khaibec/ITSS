
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AIService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ai')
export class AIController {
    constructor(private readonly aiService: AIService) { }

    @Post('review')
    @UseGuards(AuthGuard('jwt'))
    async review(
        @Body('content') content: string,
        @Body('groupId') groupId: number | undefined,
        @Req() req: any
    ) {
        // req.user has user_id, email, etc., including nationality if fetched in Strategy
        const userNationality = req.user?.nationality || 'VN'; // Default to VN if missing
        const userId = req.user?.user_id;

        return this.aiService.reviewMessage(content, userNationality, userId, groupId);
    }

    @Post('save-learning-diary')
    @UseGuards(AuthGuard('jwt'))
    async saveLearningDiary(
    @Body('message') message: string,
    @Body('groupId') groupId: number | undefined,
    @Req() req: any,
    ) {
    const userId = req.user.user_id;
    const nationality = req.user?.nationality || 'VN';

    return this.aiService.extractAndSaveLearningDiary(
        message,
        nationality,
        userId,
        groupId,
    );
    }

}
