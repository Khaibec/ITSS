import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ExplainMessageDto } from './dto/create-explain.dto';
import { AIService } from '../ai/ai.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
  ) {}

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

  /**
   * Giải thích tin nhắn bằng AI
   */
  async explainMessage(dto: ExplainMessageDto, userId: number): Promise<string> {
    const messageId = dto.message_id;

    this.logger.log(`Explaining message_id = ${messageId}`);

    try {
      // 1. Lấy message chính
      const mainMessage = await this.prisma.messages.findUnique({
        where: { message_id: messageId },
        include: { sender: true }, // để lấy sender.name
      });

      if (!mainMessage) {
        throw new NotFoundException(`Message ${messageId} not found`);
      }

      const groupId = mainMessage.group_id;

      // 2. Lấy 15 message trước đó (theo thời gian)
      const previousMessages = await this.prisma.messages.findMany({
        where: {
          group_id: groupId,
          created_at: { lt: mainMessage.created_at },
        },
        orderBy: { created_at: 'desc' },
        take: 15,
        include: { sender: true },
      });

      // Đảo thứ tự từ cũ → mới cho đúng timeline
      const orderedContext = previousMessages.reverse();

      // 3. Lấy nationality của user
      const user = await this.prisma.users.findUnique({
        where: { user_id: userId },
      });

      const nationality = user?.nationality || 'unknown';

      // 4. Tạo context sạch đẹp
      const contextText = orderedContext
        .map((msg) => {
          const name = msg.sender?.name ?? `User${msg.sender_id}`;
          const time = msg.created_at.toISOString();
          return `[${name} - ${time}]: ${msg.content}`;
        })
        .join('\n');

      const mainMessageText = mainMessage.content;

      // 5. Tạo prompt gửi sang AI
      const finalPrompt = `
User nationality: ${nationality}

Below is the conversation context (15 previous messages):
${contextText || '[No previous messages]'}

The message that needs explanation:
"${mainMessageText}"

Task:
Explain the message ABOVE in the user's native language and provide a short, learning-oriented breakdown. Keep all parts concise. Be sure to identify the true intent of the message. Sometime, the literal meaning may differ from the intended meaning. Like a flirt, joke, or express one's feelings.

Your output MUST include:

1. A short explanation of the main meaning of the sentence.

2. Key language points used in the sentence, including vocabulary meaning and usage, grammar or structure, emotional nuance or politeness level, and any relevant cultural notes. Keep each point brief, written as normal sentences (no bullet marks).

3. A few equivalent expressions that convey a similar meaning, written in short form.

4. A few short example sentences showing how the expression can be used in other contexts.

IMPORTANT:
- Do NOT translate the entire conversation context; only use it to understand nuance.
- The explanation MUST be written naturally in the user's native language (${nationality}).
- Keep the explanation friendly, clear, and concise for language learners.
- You must write the explanation in natural language, do not add bullet points or markdown or any special icons.

  `;

      // 6. Gửi sang Google Studio AI qua AIService
      const explanation = await this.aiService.explain(finalPrompt);

      this.logger.log(`Explain done for message_id = ${messageId}`);

      return explanation;
    } catch (error) {
      this.logger.error(
        `Failed to explain message ${dto.message_id}: ${error.message}`,
      );
      throw new Error(`Failed to explain message: ${error.message}`);
    }
  }

  /**
   * Đánh dấu tất cả tin nhắn trong một nhóm là đã đọc bởi user
   * @param groupId ID của nhóm chat
   * @param userId ID của user đang xem
   * @returns Số lượng tin nhắn đã được đánh dấu là đã đọc
   */
  async markMessagesAsRead(groupId: number, userId: number): Promise<number> {
    try {
      // Kiểm tra group có tồn tại không
      const group = await this.prisma.chat_groups.findUnique({
        where: { group_id: groupId },
      });
      if (!group) {
        throw new NotFoundException(`Chat group with ID ${groupId} not found`);
      }

      // Lấy tất cả message IDs trong group mà user chưa đọc
      const unreadMessages = await this.prisma.messages.findMany({
        where: {
          group_id: groupId,
        },
        select: {
          message_id: true,
        },
      });

      if (unreadMessages.length === 0) {
        this.logger.log(`No messages to mark as read for user ${userId} in group ${groupId}`);
        return 0;
      }

      const messageIds = unreadMessages.map((msg) => msg.message_id);

      // Lấy danh sách message IDs đã được đọc rồi
      const alreadyRead = await this.prisma.message_reads.findMany({
        where: {
          user_id: userId,
          message_id: { in: messageIds },
        },
        select: {
          message_id: true,
        },
      });

      const alreadyReadIds = new Set(alreadyRead.map((r) => r.message_id));

      // Chỉ đánh dấu những message chưa đọc
      const toMarkAsRead = messageIds.filter((id) => !alreadyReadIds.has(id));

      if (toMarkAsRead.length === 0) {
        this.logger.log(`All messages already read for user ${userId} in group ${groupId}`);
        return 0;
      }

      // Tạo các record trong message_reads
      await this.prisma.message_reads.createMany({
        data: toMarkAsRead.map((messageId) => ({
          message_id: messageId,
          user_id: userId,
        })),
        skipDuplicates: true, // Tránh lỗi nếu có duplicate
      });

      this.logger.log(
        `Marked ${toMarkAsRead.length} messages as read for user ${userId} in group ${groupId}`,
      );

      return toMarkAsRead.length;
    } catch (error) {
      this.logger.error(
        `Failed to mark messages as read for user ${userId} in group ${groupId}: ${error.message}`,
      );
      throw error;
    }
  }
}