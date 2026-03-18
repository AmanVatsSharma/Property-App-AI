/**
 * @file notification.module.ts
 * @module notification
 * @description Feature module: in-app notifications (stub; future FCM).
 * @author BharatERP
 * @created 2026-03-18
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationRepository } from './repository/notification.repository';
import { NotificationService } from './services/notification.service';
import { NotificationResolver } from './resolvers/notification.resolver';
import { JsonScalar } from '@api/shared/scalars/json.scalar';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [JsonScalar, NotificationRepository, NotificationService, NotificationResolver],
  exports: [NotificationService],
})
export class NotificationModule {}
