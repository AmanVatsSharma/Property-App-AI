/**
 * @file notification.module.ts
 * @module notification
 * @description Feature module: in-app notifications (stub; future FCM). WebSocket gateway for real-time push.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Notification } from './entities/notification.entity';
import { NotificationRepository } from './repository/notification.repository';
import { NotificationService } from './services/notification.service';
import { NotificationResolver } from './resolvers/notification.resolver';
import { NotificationGateway } from './gateways/notification.gateway';
import { JsonScalar } from '@api/shared/scalars/json.scalar';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'default-secret-min-16-chars',
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') ?? '7d' },
      }),
    }),
  ],
  providers: [
    JsonScalar,
    NotificationRepository,
    NotificationService,
    NotificationResolver,
    NotificationGateway,
  ],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
