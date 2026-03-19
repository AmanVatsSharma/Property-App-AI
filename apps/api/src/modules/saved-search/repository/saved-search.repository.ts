/**
 * @file saved-search.repository.ts
 * @module saved-search
 * @description Data access for SavedSearch entity.
 * @author BharatERP
 * @created 2026-03-19
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedSearch } from '../entities/saved-search.entity';

@Injectable()
export class SavedSearchRepository {
  constructor(
    @InjectRepository(SavedSearch)
    private readonly repo: Repository<SavedSearch>,
  ) {}

  async findByUserId(userId: string): Promise<SavedSearch[]> {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<SavedSearch | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAllWithAlerts(): Promise<SavedSearch[]> {
    return this.repo.find({ where: { alertEnabled: true } });
  }

  async create(userId: string, data: Partial<SavedSearch>): Promise<SavedSearch> {
    const entity = this.repo.create({ ...data, userId });
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<SavedSearch>): Promise<SavedSearch | null> {
    await this.repo.update(id, data as Record<string, unknown>);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async markAlertSent(id: string): Promise<void> {
    await this.repo.update(id, { lastAlertSentAt: new Date() });
  }
}
