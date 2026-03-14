/**
 * @file property.service.ts
 * @module property
 * @description Business logic for property CRUD and list/search; delegates to repository; geocodes location when lat/lng not provided.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Property } from '../entities/property.entity';
import { CreatePropertyDto } from '../dtos/create-property.dto';
import { UpdatePropertyDto } from '../dtos/update-property.dto';
import { PropertyFilterDto } from '../dtos/property-filter.dto';
import { PropertyNotFoundError } from '@api/common/errors';
import { PropertyRepository } from '../repository/property.repository';
import { GeocodingService } from './geocoding.service';
import { LoggerService } from '@api/shared/logger';

@Injectable()
export class PropertyService {
  constructor(
    private readonly propertyRepo: PropertyRepository,
    private readonly geocodingService: GeocodingService,
    private readonly logger: LoggerService,
  ) {}

  async findAll(filter: PropertyFilterDto): Promise<Property[]> {
    this.logger.debug('findAll entry', { method: 'findAll' });
    const result = await this.propertyRepo.findAllWithFilters(filter);
    this.logger.debug('findAll exit', { method: 'findAll', count: result.length });
    return result;
  }

  async findOne(id: string): Promise<Property> {
    this.logger.debug('findOne entry', { method: 'findOne', id });
    const property = await this.propertyRepo.findById(id);
    if (!property) {
      throw new PropertyNotFoundError(id);
    }
    this.logger.debug('findOne exit', { method: 'findOne', id });
    return property;
  }

  async create(dto: CreatePropertyDto, createdByUserId?: string | null): Promise<Property> {
    this.logger.debug('create entry', { method: 'create', createdByUserId });
    if (!createdByUserId) {
      throw new UnauthorizedException('Sign in is required to create a listing');
    }
    const existingListingCount = await this.propertyRepo.countByUserId(createdByUserId);
    const isFreeListing = existingListingCount === 0;
    let latitude = dto.latitude;
    let longitude = dto.longitude;
    if ((latitude == null || longitude == null) && dto.location) {
      const geo = await this.geocodingService.geocode(dto.location);
      if (geo) {
        latitude = geo.lat;
        longitude = geo.lng;
      }
    }
    const result = await this.propertyRepo.create(
      { ...dto, latitude, longitude },
      createdByUserId,
      isFreeListing,
    );
    this.logger.debug('create exit', { method: 'create', id: result.id, isFreeListing });
    return result;
  }

  async update(id: string, dto: UpdatePropertyDto): Promise<Property> {
    this.logger.debug('update entry', { method: 'update', id });
    const property = await this.findOne(id);
    const locationToGeocode = dto.location ?? property.location;
    if (
      locationToGeocode &&
      dto.latitude === undefined &&
      dto.longitude === undefined
    ) {
      const geo = await this.geocodingService.geocode(locationToGeocode);
      if (geo) {
        (dto as { latitude?: number; longitude?: number }).latitude = geo.lat;
        (dto as { latitude?: number; longitude?: number }).longitude = geo.lng;
      }
    }
    const result = await this.propertyRepo.update(property, dto);
    this.logger.debug('update exit', { method: 'update', id });
    return result;
  }

  async remove(id: string): Promise<boolean> {
    this.logger.debug('remove entry', { method: 'remove', id });
    const result = await this.propertyRepo.delete(id);
    this.logger.debug('remove exit', { method: 'remove', id, deleted: result });
    return result;
  }

  async getCount(): Promise<number> {
    return this.propertyRepo.count();
  }
}
