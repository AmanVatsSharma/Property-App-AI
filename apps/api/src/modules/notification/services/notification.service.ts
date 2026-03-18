/**
 * @file notification.service.ts
 * @module notification
 * @description Create and list in-app notifications; mark read (stub; future FCM push).
 * @author BharatERP
 * @created 2026-03-18
 */

import { Injectable } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';
import { NotificationRepository } from '../repository/notification.repository';

@Injectable()
export class NotificationService {
  constructor(private readonly repo: NotificationRepository) {}

  async create(
    userId: string,
    type: string,
    title: string,
    body: string,
    data?: Record<string, unknown> | null,
  ): Promise<Notification> {
    return this.repo.create({ userId, type, title, body, data: data ?? null });
  }

  async myNotifications(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<Notification[]> {
    return this.repo.findByUserId(userId, limit, offset);
  }

  async markRead(id: string, userId: string): Promise<Notification | null> {
    return this.repo.updateReadAt(id, userId);
  }

  async markAllRead(userId: string): Promise<void> {
    return this.repo.markAllReadByUserId(userId);
  }
}
