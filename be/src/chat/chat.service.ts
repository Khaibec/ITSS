import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private prisma: PrismaService) {}

  async saveMessage(senderId: number, createMessageDto: CreateMessageDto) {
    const { groupId, content } = createMessageDto;

    try {
      if (groupId) {
        const group = await this.prisma.chat_groups.findUnique({ where: { group_id: groupId } });
        if (!group) {
          this.logger.warn(`Attempted to save message for non-existent group ID: ${groupId} by user ${senderId}`);
          throw new Error(`Chat group with ID ${groupId} not found`);
        }
      }

      const newMessage = await this.prisma.messages.create({
        data: {
          sender: { connect: { user_id: senderId } },
          group: groupId ? { connect: { group_id: groupId } } : undefined,
          content,
        },
        include: {
          sender: { select: { user_id: true, name: true, email: true } },
        }
      });
      this.logger.log(`Message ${newMessage.message_id} saved by user ${senderId} to group ${groupId || 'general'}.`);
      return newMessage;
    } catch (error) {
      this.logger.error(`Failed to save message for user ${senderId}. Content: ${content}. Error: ${error.message}`);
      throw new Error(`Failed to save message: ${error.message}`);
    }
  }

  /**
   * Lấy lịch sử tin nhắn cho một nhóm cụ thể hoặc tin nhắn chung.
   * @param groupId ID của nhóm chat. Nếu null, lấy tin nhắn chung.
   * @param take Số lượng tin nhắn cần lấy.
   * @param skip Số lượng tin nhắn cần bỏ qua (để phân trang).
   * @returns Mảng các tin nhắn.
   */
  async getMessages(groupId: number | null, take = 50, skip = 0) {
    try {
      if (groupId) {
        const group = await this.prisma.chat_groups.findUnique({ where: { group_id: groupId } });
        if (!group) {
          throw new Error(`Chat group with ID ${groupId} not found`);
        }
      }

      return this.prisma.messages.findMany({
        where: {
          group_id: groupId, // Lọc theo group_id, nếu null sẽ lấy các tin nhắn không có group_id
        },
        include: {
          sender: { select: { user_id: true, name: true, email: true } },
        },
        orderBy: {
          created_at: 'asc', // Sắp xếp tin nhắn theo thời gian cũ nhất trước
        },
        take: take,
        skip: skip,
      });
    } catch (error) {
      this.logger.error(`Failed to retrieve messages for group ${groupId}. Error: ${error.message}`);
      throw new Error(`Failed to retrieve messages: ${error.message}`);
    }
  }
}