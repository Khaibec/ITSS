import {
  Controller,
  Get,
  Query,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatBoxesService } from './chat-boxes.service';
import { GetChatBoxesQueryDto, GetChatBoxesResponseDto } from './dto/get-chat-boxes.dto';

/**
 * Chat Boxes Controller
 * 
 * Handles HTTP requests for chat box list functionality.
 * 
 * @endpoint GET /api/chat-boxes
 * @description Retrieves a list of chat boxes (conversations) for a specific user.
 *              Each chat box includes group information, latest message, and unread count.
 * 
 * @query user_id (required) - Positive integer representing the user ID
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
 * @throws BadRequestException (400) - Invalid user_id format
 * @throws NotFoundException (404) - User not found
 * @throws InternalServerErrorException (500) - Database or server errors
 * 
 * @example
 * GET /api/chat-boxes?user_id=1
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
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getChatBoxes(
    @Query() query: GetChatBoxesQueryDto,
  ): Promise<GetChatBoxesResponseDto> {
    // Validate user_id
    const userId = Number(query.user_id);
    if (isNaN(userId) || userId <= 0 || !Number.isInteger(userId)) {
      throw new BadRequestException(
        'Invalid user_id. Must be a positive integer.',
      );
    }

    const data = await this.chatBoxesService.getChatBoxes(userId);

    return {
      success: true,
      data,
      message: 'Chat boxes retrieved successfully',
    };
  }
}

