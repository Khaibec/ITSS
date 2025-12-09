
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AIService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ai')
export class AIController {
    constructor(private readonly aiService: AIService) { }

    @Post('review')
    @UseGuards(AuthGuard('jwt'))
    async review(@Body('content') content: string, @Req() req: any) {
        // req.user has user_id, email, etc., including nationality if fetched in Strategy
        const userNationality = req.user?.nationality || 'VN'; // Default to VN if missing
        return this.aiService.reviewMessage(content, userNationality);
    }
}
