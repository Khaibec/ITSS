
import { Controller, Post, Body, Req, UseGuards, Get, Param, ParseIntPipe } from '@nestjs/common';
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

    // 学習日記一覧（タイトルと学習日を新しい順に）
    @Get()
    async list(@Req() req: authenticatedRequestInterface.AuthenticatedRequest) {
        return this.diariesService.listEntries(req.user.user_id);
    }

    // 学習日記詳細（ユーザー自身のレコードのみ取得）
    @Get(':id')
    async detail(
        @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
        @Param('id', new ParseIntPipe()) id: number,
    ) {
        return this.diariesService.getEntryById(req.user.user_id, id);
    }
}
