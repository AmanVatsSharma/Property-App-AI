/**
 * @file area.module.ts
 * @module area
 * @description Area/locality module for region assessment; entity, repository, service.
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

@Module({
  imports: [TypeOrmModule.forFeature([Area]), LoggerModule],
  providers: [AreaRepository, AreaService, AreaAssessorService],
  exports: [AreaService],
})
export class AreaModule {}
