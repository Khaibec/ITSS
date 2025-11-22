import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger, ValidationPipe } from '@nestjs/common';
import { WsJwtGuard } from './guards/ws-jwt.guard'; 
import { JwtService } from '@nestjs/jwt'; 
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedSocket extends Socket {
  data: { user?: { user_id: number; name: string; email: string } };
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/chat'
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService, 
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(@ConnectedSocket() client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    try {
      const authToken = client.handshake.query.token as string; 
      if (!authToken) throw new Error('No authorization header');

      const token = authToken; 
      if (!token) throw new Error('Token not found or invalid format');

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'your_secret_key',
      });

      const user = await this.prisma.users.findUnique({
        where: { user_id: payload.sub },
      });

      if (!user) throw new Error('User not found');
      
      client.data.user = { 
        user_id: user.user_id, 
        name: user.name, 
        email: user.email 
      }; 
      client.join('general_chat')
      this.logger.log(`User ${user.name} (${user.user_id}) authenticated and connected.`);

    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}: ${error.message}`);
      client.emit('error', { message: `Authentication failed: ${error.message}`, type: 'auth_error' });
      client.disconnect(true);
      return;
    }
    // Sau khi xác thực thành công, client có thể tham gia các nhóm chat nếu cần
    // hoặc bạn có thể tự động cho họ vào một phòng chat chung
    client.join('general_chat'); // Ví dụ: cho tất cả người dùng vào một phòng chung
    this.logger.log(`User ${client.data.user.name} joined 'general_chat' room.`);
  }

  handleDisconnect(@ConnectedSocket() client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const user = client.data.user;
    if (user) {
      this.logger.log(`User ${user.name} (${user.user_id}) disconnected.`);
    } else {
      this.logger.warn(`Unauthenticated client ${client.id} disconnected.`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody(ValidationPipe) payload: CreateMessageDto): Promise<void> {
    const sender = client.data.user;
    if (!sender) { // Kiểm tra lại sender đề phòng
      this.logger.error(`Sender not found for client ${client.id} in sendMessage handler.`);
      client.emit('error', { message: 'Authentication required to send message.', type: 'auth_required' });
      return;
    }
    this.logger.log(`User ${sender.name} (${sender.user_id}) sending message: "${payload.content}" to group ${payload.groupId || 'general'}.`);

    try {
      const savedMessage = await this.chatService.saveMessage(sender.user_id, payload);

      if (!savedMessage) {
        client.emit('error', { message: 'Failed to send message: Group not found or invalid.', type: 'invalid_group' });
        return;
      }

    if (payload.groupId) {
            // Phát đến phòng chat của nhóm cụ thể
            this.server.to(`group-${payload.groupId}`).emit('receiveMessage', savedMessage);
            this.logger.log(`Message ${savedMessage.message_id} broadcasted to group-${payload.groupId}.`);
        } else {
            // Phát đến phòng chat chung
            this.server.to('general_chat').emit('receiveMessage', savedMessage);
            this.logger.log(`Message ${savedMessage.message_id} broadcasted to 'general_chat' room.`);
        }
        } catch (error) {
        this.logger.error(`Error processing message from user ${sender.user_id}: ${error.message}`);
        client.emit('error', { message: `Failed to send message: ${error.message}`, type: 'server_error' });
        }
    }

    @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() groupId: number): void {
    if (!client.data.user) { // Kiểm tra xác thực thủ công nếu không dùng Guard
        client.emit('error', { message: 'Authentication required to join a room.', type: 'auth_required' });
        this.logger.error(`Attempted to join room for unauthenticated client ${client.id}.`);
        return;
    }
    if (!Number.isInteger(groupId) || groupId <= 0) {
      client.emit('error', { message: 'Invalid group ID for joinRoom.', type: 'validation_error' });
      this.logger.warn(`User ${client.data.user.user_id} attempted to join room with invalid ID: ${groupId}`);
      return;
    }
    client.join(`group-${groupId}`); // Thêm client vào phòng Socket.IO
    this.logger.log(`User ${client.data.user.name} (${client.data.user.user_id}) joined group-${groupId}`);
    client.emit('joinedRoom', `You have joined group-${groupId}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() groupId: number): void {
    if (!client.data.user) { // Kiểm tra xác thực thủ công nếu không dùng Guard
        client.emit('error', { message: 'Authentication required to leave a room.', type: 'auth_required' });
        this.logger.error(`Attempted to leave room for unauthenticated client ${client.id}.`);
        return;
    }
    if (!Number.isInteger(groupId) || groupId <= 0) {
      client.emit('error', { message: 'Invalid group ID for leaveRoom.', type: 'validation_error' });
      this.logger.warn(`User ${client.data.user.user_id} attempted to leave room with invalid ID: ${groupId}`);
      return;
    }
    client.leave(`group-${groupId}`); 
    this.logger.log(`User ${client.data.user.name} (${client.data.user.user_id}) left group-${groupId}`);
    client.emit('leftRoom', `You have left group-${groupId}`);
  }

}