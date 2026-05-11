/**
 * File:        apps/api/src/modules/area/area.module.ts
 * Module:      Area · NestJS module
 * Purpose:     Locality / region intelligence: area assessment, price forecast,
 *              RERA verification, document analysis, negotiation advice. These
 *              services together back the "AI moat" tools surfaced via the
 *              agent (see agent-tools.service.ts).
 *
 * Exports:
 *   - AreaService                  — locality lookup / getOrCreate
 *   - PriceForecastService         — LLM-backed price forecast
 *   - ReraCheckService             — RERA registration check
 *   - DocumentAnalysisService      — legal document risk analysis
 *   - NegotiationAdvisorService    — offer + bid strategy
 *
 * Depends on:
 *   - TypeOrmModule(Area)          — entity persistence
 *   - LoggerModule                 — structured logging
 *   - MetricsModule                — Prometheus llm_tokens_total
 *
 * Side-effects: none at module scope.
 *
 * Key invariants:
 *   - AreaModule MUST NOT import PropertyModule (PropertyModule imports
 *     AreaModule — circular dep would result). Services that need property
 *     facts accept them as plain inputs from the caller.
 *
 * Read order:
 *   1. providers / exports (this file)
 *   2. services/area.service       — base lookup
 *   3. services/price-forecast     — pattern reference for the AI services
 *
 * Author:       UrbanNest.ai team
 * Last-updated: 2026-05-07
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '@api/shared/logger';
import { MetricsModule } from '@api/modules/metrics/metrics.module';
import { Area } from './entities/area.entity';
import { AreaRepository } from './repository/area.repository';
import { AreaService } from './services/area.service';
import { AreaAssessorService } from './services/area-assessor.service';
import { PriceForecastService } from './services/price-forecast.service';
import { ReraCheckService } from './services/rera-check.service';
import { DocumentAnalysisService } from './services/document-analysis.service';
import { NegotiationAdvisorService } from './services/negotiation-advisor.service';
import { NeighbourhoodController } from './controllers/neighbourhood.controller';
import { Property } from '@api/modules/property/entities/property.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Area, Property]), LoggerModule, MetricsModule],
  controllers: [NeighbourhoodController],
  providers: [
    AreaRepository,
    AreaService,
    AreaAssessorService,
    PriceForecastService,
    ReraCheckService,
    DocumentAnalysisService,
    NegotiationAdvisorService,
  ],
  exports: [
    AreaService,
    PriceForecastService,
    ReraCheckService,
    DocumentAnalysisService,
    NegotiationAdvisorService,
  ],
})
export class AreaModule {}
