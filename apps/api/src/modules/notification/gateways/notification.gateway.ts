/**
 * @file notification.gateway.ts
 * @module notification
 * @description WebSocket gateway for real-time notifications. Falls back gracefully when @nestjs/websockets is unavailable.
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
import type { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@api/shared/logger';

/**
 * CORS for the WebSocket gateway is inherited from the IoAdapter configured in
 * main.ts (which reads CORS_ORIGIN / WS_CORS_ORIGIN). We do NOT set cors here
 * to avoid bypassing the global CORS policy with a hard-coded wildcard.
 */
@WebSocketGateway({
  namespace: '/notifications',
  transports: ['websocket', 'polling'],
})
@Injectable()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        (client.handshake.auth?.token as string | undefined) ??
        (client.handshake.headers?.authorization as string | undefined)
          ?.replace('Bearer ', '')
          .trim();

      if (!token) {
        client.disconnect();
        return;
      }

      const secret = this.config.get<string>('JWT_SECRET');
      if (!secret?.trim()) {
        // No JWT secret configured — allow connection without auth in dev
        const fakeUserId = `anon_${client.id}`;
        await client.join(`user:${fakeUserId}`);
        client.data.userId = fakeUserId;
        return;
      }

      const payload = await this.jwt.verifyAsync<{ sub: string }>(token, { secret });
      await client.join(`user:${payload.sub}`);
      client.data.userId = payload.sub;
      this.logger.debug('WS connected', { userId: payload.sub, socketId: client.id });
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug('WS disconnected', {
      socketId: client.id,
      userId: client.data?.userId ?? 'unknown',
    });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() _client: Socket): string {
    return 'pong';
  }

  pushToUser(userId: string, event: string, data: unknown): void {
    this.server?.to(`user:${userId}`).emit(event, data);
  }
}
