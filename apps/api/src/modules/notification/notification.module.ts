/**
 * @file notification.module.ts
 * @module notification
 * @description Feature module: in-app + real-time WebSocket notifications.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationRepository } from './repository/notification.repository';
import { NotificationService } from './services/notification.service';
import { NotificationResolver } from './resolvers/notification.resolver';
import { NotificationGateway } from './gateways/notification.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [
    NotificationRepository,
    NotificationGateway,
    NotificationService,
    NotificationResolver,
  ],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
