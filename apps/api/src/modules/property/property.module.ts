/**
 * @file property.module.ts
 * @module property
 * @description Feature module: Property entity, service, GraphQL resolver.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { PropertyService } from './services/property.service';
import { GeocodingService } from './services/geocoding.service';
import { NearbyService } from './services/nearby.service';
import { PropertyResolver } from './resolvers/property.resolver';
import { PropertyRepository } from './repository/property.repository';
import { AreaModule } from '@api/modules/area/area.module';
import { SearchModule } from '@api/modules/search/search.module';
import { SearchController } from './controllers/search.controller';
import { MetricsModule } from '@api/modules/metrics/metrics.module';

@Module({
  imports: [TypeOrmModule.forFeature([Property]), AreaModule, SearchModule, MetricsModule],
  controllers: [SearchController],
  providers: [PropertyRepository, GeocodingService, NearbyService, PropertyService, PropertyResolver],
  exports: [PropertyService],
})
export class PropertyModule {}
