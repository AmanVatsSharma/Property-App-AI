/**
 * @file neighbourhood.controller.ts
 * @module area
 * @description REST controller for neighbourhood/area score; GET /api/v1/neighbourhood.
 * @author BharatERP
 * @created 2026-03-15
 */

import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '@api/common/decorators/public.decorator';
import { AreaService } from '../services/area.service';
import { NeighbourhoodQueryDto } from '../dtos/neighbourhood-query.dto';
import { Area } from '../entities/area.entity';

/** Response shape for GET /api/v1/neighbourhood. */
export interface NeighbourhoodScoreResponse {
  locality: string;
  city: string;
  livabilityScore: number | null;
  connectivityScore: number | null;
  schoolsScore: number | null;
  safetyScore: number | null;
  priceTrendPctAnnual: number | null;
  amenitiesSummary: string | null;
  lastAssessedAt: string | null;
}

function toResponse(area: Area): NeighbourhoodScoreResponse {
  const priceTrend =
    area.priceTrendPctAnnual != null ? Number(area.priceTrendPctAnnual) : null;
  return {
    locality: area.locality,
    city: area.city,
    livabilityScore: area.livabilityScore ?? null,
    connectivityScore: area.connectivityScore ?? null,
    schoolsScore: area.schoolsScore ?? null,
    safetyScore: area.safetyScore ?? null,
    priceTrendPctAnnual: priceTrend,
    amenitiesSummary: area.amenitiesSummary ?? null,
    lastAssessedAt: area.lastAssessedAt ? area.lastAssessedAt.toISOString() : null,
  };
}

@Controller('api/v1')
export class NeighbourhoodController {
  constructor(private readonly areaService: AreaService) {}

  /**
   * GET /api/v1/neighbourhood?locality=Whitefield&city=Bangalore
   * Returns area scores (livability, connectivity, schools, safety, price trend, amenities).
   * Triggers assessment if area is missing or stale (assessIfMissing: true).
   */
  @Get('neighbourhood')
  @Public()
  async getNeighbourhoodScore(
    @Query() query: NeighbourhoodQueryDto
  ): Promise<NeighbourhoodScoreResponse> {
    const locality = query.locality.trim();
    const city = (query.city ?? '').trim();
    const area = await this.areaService.getOrCreate(locality, city, {
      assessIfMissing: true,
    });
    return toResponse(area);
  }
}
