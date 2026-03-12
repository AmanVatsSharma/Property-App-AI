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
import { PropertyResolver } from './resolvers/property.resolver';
import { PropertyRepository } from './repository/property.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Property])],
  providers: [PropertyRepository, GeocodingService, PropertyService, PropertyResolver],
  exports: [PropertyService],
})
export class PropertyModule {}
