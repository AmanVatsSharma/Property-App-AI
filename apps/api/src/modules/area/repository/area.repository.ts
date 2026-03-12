/**
 * @file area.repository.ts
 * @module area
 * @description Data access for Area entity; findByLocalityAndCity, create, update.
 * @author BharatERP
 * @created 2025-03-13
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area, type AreaDataSource } from '../entities/area.entity';

export function normalizeLocalityCity(locality: string, city: string): { localityNormalized: string; cityNormalized: string } {
  const localityNormalized = (locality ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  const cityNormalized = (city ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  return { localityNormalized, cityNormalized };
}

export interface CreateAreaData {
  locality: string;
  city: string;
  localityNormalized: string;
  cityNormalized: string;
}

export interface UpdateAreaData {
  livabilityScore?: number | null;
  priceTrendPctAnnual?: number | null;
  connectivityScore?: number | null;
  schoolsScore?: number | null;
  safetyScore?: number | null;
  amenitiesSummary?: string | null;
  dataSource?: AreaDataSource | null;
  lastAssessedAt?: Date | null;
  latitude?: number | null;
  longitude?: number | null;
}

@Injectable()
export class AreaRepository {
  constructor(
    @InjectRepository(Area)
    private readonly repo: Repository<Area>,
  ) {}

  async findByLocalityAndCity(locality: string, city: string): Promise<Area | null> {
    const { localityNormalized, cityNormalized } = normalizeLocalityCity(locality, city);
    return this.repo.findOne({
      where: { localityNormalized, cityNormalized },
    });
  }

  async findById(id: string): Promise<Area | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: CreateAreaData): Promise<Area> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: UpdateAreaData): Promise<Area> {
    await this.repo.update(id, data as Record<string, unknown>);
    const updated = await this.findById(id);
    if (!updated) throw new Error('Area not found after update');
    return updated;
  }
}
