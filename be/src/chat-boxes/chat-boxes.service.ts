import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatBoxItemDto } from './dto/get-chat-boxes.dto';

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
}

