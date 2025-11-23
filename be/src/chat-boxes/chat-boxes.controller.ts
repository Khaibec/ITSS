import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatBoxesService } from './chat-boxes.service';
import { GetChatBoxesResponseDto, GetChatBoxMessagesResponseDto } from './dto/get-chat-boxes.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../common/interface/authenticated-request.interface';

/**
 * Chat Boxes Controller
 * 
 * Handles HTTP requests for chat box list functionality.
 * 
 * @endpoint GET /api/chat-boxes
 * @description Retrieves a list of chat boxes (conversations) for the authenticated user.
 *              Each chat box includes group information, latest message, and unread count.
 *              Requires JWT authentication. User ID is automatically extracted from the JWT token.
 * 
 * @header Authorization (required) - Bearer token: "Bearer <JWT_TOKEN>"
 * 
 * @returns GetChatBoxesResponseDto
 *   - success: boolean
 *   - data: Array of ChatBoxItemDto
 *     - group_id: number
 *     - group_name: string
 *     - icon_url?: string
 *     - latest_message?: string
 *     - latest_message_time?: Date
 *     - latest_message_sender?: string
 *     - unread_count: number
 *     - created_at: Date
 *   - message?: string
 * 
 * @throws UnauthorizedException (401) - Missing or invalid JWT token
 * @throws NotFoundException (404) - User not found
 * @throws InternalServerErrorException (500) - Database or server errors
 * 
 * @example
 * GET /api/chat-boxes
 * Headers: Authorization: Bearer <JWT_TOKEN>
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "group_id": 1,
 *       "group_name": "Japanese Learning Group",
 *       "icon_url": "https://example.com/icon.png",
 *       "latest_message": "こんにちは",
 *       "latest_message_time": "2024-01-15T10:30:00Z",
 *       "latest_message_sender": "John Doe",
 *       "unread_count": 3,
 *       "created_at": "2024-01-01T00:00:00Z"
 *     }
 *   ],
 *   "message": "Chat boxes retrieved successfully"
 * }
 */
@Controller('api/chat-boxes')
export class ChatBoxesController {
  constructor(private readonly chatBoxesService: ChatBoxesService) {}

  /**
   * Get chat boxes for a user
   * 
   * Returns all chat groups where the user is a member, sorted by latest message time.
   * Groups with no messages are sorted to the end.
   * 
   * Requires JWT authentication. User ID is automatically extracted from the JWT token.
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getChatBoxes(
    @Req() req: AuthenticatedRequest,
  ): Promise<GetChatBoxesResponseDto> {
    // Get user_id from JWT token (already validated by JwtAuthGuard)
    const userId = req.user.user_id;

    const data = await this.chatBoxesService.getChatBoxes(userId);

    return {
      success: true,
      data,
      message: 'Chat boxes retrieved successfully',
    };
  }

  /**
   * Get messages for a specific chat box
   * 
   * Returns the 40 most recent messages in a chat group, ordered from oldest to newest.
   * 
   * Requires JWT authentication. User ID is automatically extracted from the JWT token.
   * User must be a member of the chat group to access its messages.
   * 
   * @param groupId ID of the chat group
   * @returns GetChatBoxMessagesResponseDto containing array of 40 most recent messages
   * 
   * @throws UnauthorizedException (401) - Missing or invalid JWT token
   * @throws NotFoundException (404) - User or chat group not found
   * @throws ForbiddenException (403) - User is not a member of the chat group
   * @throws InternalServerErrorException (500) - Database or server errors
   * 
   * @example
   * GET /api/chat-boxes/1/messages
   * Headers: Authorization: Bearer <JWT_TOKEN>
   * 
   * Response:
   * {
   *   "success": true,
   *   "data": [
   *     {
   *       "message_id": 1,
   *       "content": "こんにちは",
   *       "created_at": "2024-01-15T10:30:00Z",
   *       "sender": {
   *         "user_id": 1,
   *         "name": "John Doe",
   *         "email": "john@example.com"
   *       }
   *     }
   *   ],
   *   "message": "Chat box messages retrieved successfully"
   * }
   */
  @Get(':groupId/messages')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getChatBoxMessages(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<GetChatBoxMessagesResponseDto> {
    // Get user_id from JWT token (already validated by JwtAuthGuard)
    const userId = req.user.user_id;

    const data = await this.chatBoxesService.getChatBoxMessages(userId, groupId);

    return {
      success: true,
      data,
      message: 'Chat box messages retrieved successfully',
    };
  }
}

