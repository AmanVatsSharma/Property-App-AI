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
import { PropertyService } from './property.service';
import { PropertyResolver } from './property.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Property])],
  providers: [PropertyService, PropertyResolver],
  exports: [PropertyService],
})
export class PropertyModule {}
