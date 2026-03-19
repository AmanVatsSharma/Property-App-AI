/**
 * @file area.module.ts
 * @module area
 * @description Area/locality module for region assessment; price forecast.
 * @author BharatERP
 * @created 2025-03-13
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '@api/shared/logger';
import { Area } from './entities/area.entity';
import { AreaRepository } from './repository/area.repository';
import { AreaService } from './services/area.service';
import { AreaAssessorService } from './services/area-assessor.service';
import { PriceForecastService } from './services/price-forecast.service';
import { NeighbourhoodController } from './controllers/neighbourhood.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Area]), LoggerModule],
  controllers: [NeighbourhoodController],
  providers: [AreaRepository, AreaService, AreaAssessorService, PriceForecastService],
  exports: [AreaService, PriceForecastService],
})
export class AreaModule {}
