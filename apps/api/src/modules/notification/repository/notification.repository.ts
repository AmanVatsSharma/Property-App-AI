/**
 * @file notification.repository.ts
 * @module notification
 * @description Data access for Notification entity.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async findById(id: string): Promise<Notification | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown> | null;
  }): Promise<Notification> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findByUserId(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<Notification[]> {
    const qb = this.repo
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .orderBy('n.readAt', 'ASC', 'NULLS FIRST')
      .addOrderBy('n.createdAt', 'DESC')
      .take(limit)
      .skip(offset);
    return qb.getMany();
  }

  async updateReadAt(id: string, userId: string): Promise<Notification | null> {
    const entity = await this.repo.findOne({ where: { id, userId } });
    if (!entity) return null;
    entity.readAt = new Date();
    return this.repo.save(entity);
  }

  async markAllReadByUserId(userId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(Notification)
      .set({ readAt: new Date() })
      .where('userId = :userId', { userId })
      .andWhere('readAt IS NULL')
      .execute();
  }
}
