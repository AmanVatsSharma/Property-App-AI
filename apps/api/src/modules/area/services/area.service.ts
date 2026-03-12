/**
 * @file area.service.ts
 * @module area
 * @description Get-or-create Area by locality/city; used by agent tools for region assessment.
 * @author BharatERP
 * @created 2025-03-13
 */

import { Injectable } from '@nestjs/common';
import { Area } from '../entities/area.entity';
import { AreaRepository, normalizeLocalityCity } from '../repository/area.repository';
import { AreaAssessorService } from './area-assessor.service';
import { LoggerService } from '../../../shared/logger';

export interface GetOrCreateOptions {
  assessIfMissing?: boolean;
}

@Injectable()
export class AreaService {
  constructor(
    private readonly areaRepo: AreaRepository,
    private readonly assessor: AreaAssessorService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Find area by normalized locality and city, or create with null scores.
   * When assessIfMissing is true, runs AreaAssessorService.assess if area has no scores or is stale.
   */
  async getOrCreate(locality: string, city: string = '', options?: GetOrCreateOptions): Promise<Area> {
    const trimmedLocality = (locality ?? '').trim() || 'Unknown';
    const trimmedCity = (city ?? '').trim();
    const { localityNormalized, cityNormalized } = normalizeLocalityCity(trimmedLocality, trimmedCity);

    let area = await this.areaRepo.findByLocalityAndCity(trimmedLocality, trimmedCity);
    if (!area) {
      area = await this.areaRepo.create({
        locality: trimmedLocality,
        city: trimmedCity,
        localityNormalized,
        cityNormalized,
      });
      this.logger.debug('getOrCreate area created', { areaId: area.id, locality: trimmedLocality, city: trimmedCity });
    } else {
      this.logger.debug('getOrCreate area found', { areaId: area.id, locality: trimmedLocality, city: trimmedCity });
    }

    if (options?.assessIfMissing && this.assessor.needsAssessment(area)) {
      area = await this.assessor.assess(area);
    }
    return area;
  }

  async findById(id: string): Promise<Area | null> {
    return this.areaRepo.findById(id);
  }
}
