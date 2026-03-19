/**
 * @file notification.gateway.ts
 * @module notification
 * @description WebSocket gateway for real-time in-app notifications.
 * Clients subscribe to their own userId room after auth.
 * @author BharatERP
 * @created 2026-03-19
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@api/shared/logger';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/notifications',
  transports: ['websocket', 'polling'],
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        (client.handshake.auth?.token as string | undefined) ??
        (client.handshake.headers?.authorization as string | undefined)?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const secret = this.config.get<string>('JWT_SECRET');
      if (!secret) {
        client.disconnect();
        return;
      }

      const payload = await this.jwt.verifyAsync<{ sub: string }>(token, { secret });
      const userId = payload.sub;

      await client.join(`user:${userId}`);
      client.data.userId = userId;

      this.logger.debug('WS connected', { userId, socketId: client.id });
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug('WS disconnected', {
      socketId: client.id,
      userId: client.data?.userId,
    });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() _client: Socket): string {
    return 'pong';
  }

  /**
   * Push a notification event to a specific user's room.
   * Call this from NotificationService after creating a notification.
   */
  pushToUser(userId: string, event: string, data: unknown): void {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
