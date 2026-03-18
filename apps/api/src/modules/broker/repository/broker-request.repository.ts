/**
 * @file broker-request.repository.ts
 * @module broker
 * @description Data access for BrokerRequest entity.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrokerRequest } from '../entities/broker-request.entity';

@Injectable()
export class BrokerRequestRepository {
  constructor(
    @InjectRepository(BrokerRequest)
    private readonly repo: Repository<BrokerRequest>,
  ) {}

  async findByUserId(userId: string): Promise<BrokerRequest | null> {
    return this.repo.findOne({ where: { userId } });
  }

  async findById(id: string): Promise<BrokerRequest | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(userId: string, documents?: Record<string, unknown> | null): Promise<BrokerRequest> {
    const entity = this.repo.create({ userId, status: 'pending', documents: documents ?? null });
    return this.repo.save(entity);
  }

  async updateStatus(
    id: string,
    status: string,
    reviewedByUserId: string,
    adminNote?: string | null,
  ): Promise<BrokerRequest> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error('BrokerRequest not found');
    entity.status = status;
    entity.reviewedAt = new Date();
    entity.reviewedByUserId = reviewedByUserId;
    if (adminNote !== undefined) entity.adminNote = adminNote ?? null;
    return this.repo.save(entity);
  }
}
