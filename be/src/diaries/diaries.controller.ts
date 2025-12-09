
import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { DiariesService } from './diaries.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import * as authenticatedRequestInterface from '../common/interface/authenticated-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('diaries')
export class DiariesController {
    constructor(private readonly diariesService: DiariesService) { }

    @Post()
    async create(
        @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
        @Body() body: { original: string; warning?: string; suggestion?: string }
    ) {
        return this.diariesService.createEntry(req.user.user_id, body);
    }
}
