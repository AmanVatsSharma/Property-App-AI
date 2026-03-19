/**
 * @file neighbourhood.controller.ts
 * @module area
 * @description REST: GET /api/v1/neighbourhood, GET /api/v1/price-forecast
 * @author BharatERP
 * @created 2026-03-15
 */

import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '@api/common/decorators/public.decorator';
import { AreaService } from '../services/area.service';
import { PriceForecastService, type PriceForecastResult } from '../services/price-forecast.service';
import { NeighbourhoodQueryDto } from '../dtos/neighbourhood-query.dto';
import type { Area } from '../entities/area.entity';

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
  return {
    locality: area.locality,
    city: area.city,
    livabilityScore: area.livabilityScore ?? null,
    connectivityScore: area.connectivityScore ?? null,
    schoolsScore: area.schoolsScore ?? null,
    safetyScore: area.safetyScore ?? null,
    priceTrendPctAnnual: area.priceTrendPctAnnual != null ? Number(area.priceTrendPctAnnual) : null,
    amenitiesSummary: area.amenitiesSummary ?? null,
    lastAssessedAt: area.lastAssessedAt ? area.lastAssessedAt.toISOString() : null,
  };
}

@Controller('api/v1')
export class NeighbourhoodController {
  constructor(
    private readonly areaService: AreaService,
    private readonly priceForecastService: PriceForecastService,
  ) {}

  @Get('neighbourhood')
  @Public()
  async getNeighbourhoodScore(
    @Query() query: NeighbourhoodQueryDto,
  ): Promise<NeighbourhoodScoreResponse> {
    const locality = query.locality.trim();
    const city = (query.city ?? '').trim();
    const area = await this.areaService.getOrCreate(locality, city, { assessIfMissing: true });
    return toResponse(area);
  }

  @Get('price-forecast')
  @Public()
  async getPriceForecast(
    @Query() query: NeighbourhoodQueryDto,
    @Query('horizon') horizon?: string,
  ): Promise<PriceForecastResult> {
    const locality = query.locality.trim();
    const city = (query.city ?? '').trim();
    const horizonMonths = Math.min(36, Math.max(12, parseInt(horizon ?? '24', 10) || 24));
    return this.priceForecastService.getForecast(locality, city, horizonMonths);
  }
}
