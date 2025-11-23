import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatBoxItemDto, MessageItemDto } from './dto/get-chat-boxes.dto';

@Injectable()
export class ChatBoxesService {
  constructor(private prisma: PrismaService) {}

  async getChatBoxes(userId: number): Promise<ChatBoxItemDto[]> {
    try {
      // Validate user exists
      const user = await this.prisma.users.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Get all groups where user is a member
      const groupMemberships = await this.prisma.group_members.findMany({
        where: { user_id: userId },
        include: {
          group: {
            include: {
              messages: {
                orderBy: { created_at: 'desc' },
                take: 1,
                include: {
                  sender: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Process each group to get unread count and format response
      const chatBoxes: ChatBoxItemDto[] = await Promise.all(
        groupMemberships.map(async (membership) => {
          const group = membership.group;
          const latestMessage = group.messages[0] || null;

          // Count unread messages (messages without corresponding message_reads for this user)
          // More efficient: count total messages and subtract read messages
          const totalMessages = await this.prisma.messages.count({
            where: { group_id: group.group_id },
          });

          const readMessages = await this.prisma.message_reads.count({
            where: {
              user_id: userId,
              message: {
                group_id: group.group_id,
              },
            },
          });

          // Ensure unreadCount is never negative (safety check)
          const unreadCount = Math.max(0, totalMessages - readMessages);

          return {
            group_id: group.group_id,
            group_name: group.group_name,
            icon_url: group.icon_url || undefined,
            latest_message: latestMessage?.content || undefined,
            latest_message_time: latestMessage?.created_at || undefined,
            latest_message_sender: latestMessage?.sender?.name || undefined,
            unread_count: unreadCount,
            created_at: group.created_at,
          };
        }),
      );

      // Sort by latest message time (most recent first), groups with no messages go to end
      chatBoxes.sort((a, b) => {
        if (!a.latest_message_time && !b.latest_message_time) return 0;
        if (!a.latest_message_time) return 1;
        if (!b.latest_message_time) return -1;
        return (
          new Date(b.latest_message_time).getTime() -
          new Date(a.latest_message_time).getTime()
        );
      });

      return chatBoxes;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new InternalServerErrorException(
        `Failed to retrieve chat boxes: ${errorMessage}`,
      );
    }
  }

  /**
   * Lấy 40 tin nhắn gần nhất trong một chat-box (group)
   * @param userId ID của user đang yêu cầu
   * @param groupId ID của chat group
   * @returns Mảng 40 tin nhắn gần nhất, sắp xếp từ cũ đến mới
   */
  async getChatBoxMessages(userId: number, groupId: number): Promise<MessageItemDto[]> {
    try {
      // Validate user exists
      const user = await this.prisma.users.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Validate group exists
      const group = await this.prisma.chat_groups.findUnique({
        where: { group_id: groupId },
      });

      if (!group) {
        throw new NotFoundException(`Chat group with ID ${groupId} not found`);
      }

      // Check if user is a member of this group
      const membership = await this.prisma.group_members.findUnique({
        where: {
          group_id_user_id: {
            group_id: groupId,
            user_id: userId,
          },
        },
      });

      if (!membership) {
        throw new ForbiddenException(`User ${userId} is not a member of group ${groupId}`);
      }

      // Get 40 most recent messages, ordered from oldest to newest
      const messages = await this.prisma.messages.findMany({
        where: {
          group_id: groupId,
        },
        include: {
          sender: {
            select: {
              user_id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc', // Lấy tin nhắn mới nhất trước
        },
        take: 40, // Lấy 40 tin nhắn
      });

      // Reverse để sắp xếp từ cũ đến mới (cho hiển thị)
      const sortedMessages = messages.reverse();

      return sortedMessages.map((message) => ({
        message_id: message.message_id,
        content: message.content,
        created_at: message.created_at,
        sender: message.sender ? {
          user_id: message.sender.user_id,
          name: message.sender.name,
          email: message.sender.email,
        } : null,
      }));
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new InternalServerErrorException(
        `Failed to retrieve chat box messages: ${errorMessage}`,
      );
    }
  }
}

