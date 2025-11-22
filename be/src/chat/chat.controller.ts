import { Controller, Get, Param, Query, UseGuards, Req, ParseIntPipe, DefaultValuePipe, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard'; // Guard HTTP của bạn
import { ChatService } from './chat.service';
import * as authenticatedRequestInterface from '../common/interface/authenticated-request.interface';

@UseGuards(JwtAuthGuard) // Bảo vệ tất cả các route trong controller này
@Controller('messages') // Endpoint base cho API tin nhắn
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  /**
   * API để lấy lịch sử tin nhắn cho một nhóm cụ thể.
   * GET /messages/group/:groupId
   * @param groupId ID của nhóm chat
   * @param take Số lượng tin nhắn cần lấy (phân trang)
   * @param skip Số lượng tin nhắn cần bỏ qua (phân trang)
   * @param req Request object chứa thông tin người dùng đã xác thực
   * @returns Mảng các tin nhắn.
   */
  @Get('group/:groupId')
  async getGroupMessages(
    @Param('groupId', ParseIntPipe) groupId: number, // Đảm bảo groupId là số nguyên
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take: number, // Mặc định 50, phải là số nguyên
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number, // Mặc định 0, phải là số nguyên
    @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
  ) {
    this.logger.log(`User ${req.user.user_id} requested messages for group ${groupId}`);
    try {
      const messages = await this.chatService.getMessages(groupId, take, skip);
      return messages;
    } catch (error) {
      this.logger.error(`Error getting group messages for user ${req.user.user_id}, group ${groupId}: ${error.message}`);
      throw error; // NestJS sẽ tự động chuyển đổi các lỗi sang HTTP Exception
    }
  }

  /**
   * API để lấy lịch sử tin nhắn chung (không thuộc nhóm cụ thể).
   * GET /messages/general
   * @param take Số lượng tin nhắn cần lấy.
   * @param skip Số lượng tin nhắn cần bỏ qua.
   * @param req Request object chứa thông tin người dùng đã xác thực
   * @returns Mảng các tin nhắn.
   */
  @Get('general')
  async getGeneralMessages(
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Req() req: authenticatedRequestInterface.AuthenticatedRequest,
  ) {
    this.logger.log(`User ${req.user.user_id} requested general messages.`);
    try {
      const messages = await this.chatService.getMessages(null, take, skip); // Truyền null để lấy tin nhắn không có group_id
      return messages;
    } catch (error) {
      this.logger.error(`Error getting general messages for user ${req.user.user_id}: ${error.message}`);
      throw error;
    }
  }
}