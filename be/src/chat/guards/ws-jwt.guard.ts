import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { PrismaService } from '../../prisma/prisma.service';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const authToken = client.handshake.headers.authorization;

    if (!authToken) {
      this.logger.error(`Unauthorized: No authorization header provided by client ${client.id}`);
      throw new WsException('Unauthorized: No authorization header');
    }

    try {
      const token = authToken.split(' ')[1];
      if (!token) {
        this.logger.error(`Unauthorized: Token format invalid for client ${client.id}`);
        throw new WsException('Unauthorized: Token not found or invalid format');
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'your_secret_key',
      });

      const user = await this.prisma.users.findUnique({
        where: { user_id: payload.sub },
      });

      if (!user) {
        this.logger.error(`Unauthorized: User with ID ${payload.sub} not found in DB for client ${client.id}`);
        throw new WsException('Unauthorized: User not found');
      }
      
      client.data.user = { 
        user_id: user.user_id, 
        name: user.name, 
        email: user.email 
      }; 
      this.logger.log(`Client ${client.id} authenticated as user ${user.name} (${user.user_id}).`);
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        this.logger.warn(`Unauthorized: Token expired for client ${client.id}. Error: ${error.message}`);
        throw new WsException('Unauthorized: Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        this.logger.warn(`Unauthorized: Invalid JWT for client ${client.id}. Error: ${error.message}`);
        throw new WsException('Unauthorized: Invalid token');
      }
      this.logger.error(`Authentication failed for client ${client.id}. Error: ${error.message}`);
      throw new WsException('Unauthorized: Authentication failed');
    }
  }
}