/**
 * @file property.service.ts
 * @module property
 * @description Business logic for property CRUD and list/search; delegates to repository; geocodes location when lat/lng not provided; resolves area (areaId, locality, city) for listing enrichment.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Property } from '../entities/property.entity';
import { UserRole } from '@api/modules/user/entities/user.entity';
import { CreatePropertyDto } from '../dtos/create-property.dto';
import { UpdatePropertyDto } from '../dtos/update-property.dto';
import { PropertyFilterDto } from '../dtos/property-filter.dto';
import { PropertyNotFoundError, ValidationError } from '@api/common/errors';
import { PropertyRepository } from '../repository/property.repository';
import { GeocodingService } from './geocoding.service';
import { NearbyService } from './nearby.service';
import { AreaService } from '@api/modules/area/services/area.service';
import { LoggerService } from '@api/shared/logger';

@Injectable()
export class PropertyService {
  constructor(
    private readonly propertyRepo: PropertyRepository,
    private readonly geocodingService: GeocodingService,
    private readonly nearbyService: NearbyService,
    private readonly areaService: AreaService,
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

  private assertOwnerOrAdmin(
    property: Property,
    requestingUserId: string,
    requestingUserRole: string,
  ): void {
    if (requestingUserRole === UserRole.ADMIN) return;
    if (property.createdByUserId !== requestingUserId) {
      throw new ForbiddenException('You do not own this listing');
    }
  }

  async create(dto: CreatePropertyDto, createdByUserId?: string | null): Promise<Property> {
    this.logger.debug('create entry', { method: 'create', createdByUserId });
    if (!createdByUserId) {
      throw new UnauthorizedException('Sign in is required to create a listing');
    }
    const existingListingCount = await this.propertyRepo.countByUserId(createdByUserId);
    const isFreeListing = existingListingCount === 0;
    if (existingListingCount > 0 && !isFreeListing) {
      throw new ForbiddenException(
        'Free listing limit reached. Please upgrade to post more listings.',
      );
    }
    let latitude = dto.latitude;
    let longitude = dto.longitude;
    let locality = dto.locality;
    let city = dto.city;
    let areaId = dto.areaId;
    if ((latitude == null || longitude == null) && dto.location) {
      const geo = await this.geocodingService.geocode(dto.location);
      if (geo) {
        latitude = geo.lat;
        longitude = geo.lng;
        if (geo.locality) locality = geo.locality;
        if (geo.city) city = geo.city;
      }
    }
    if ((locality != null || city != null) && !areaId) {
      const area = await this.areaService.getOrCreate(locality ?? 'Unknown', city ?? '', {
        assessIfMissing: true,
      });
      areaId = area.id;
      locality = area.locality;
      city = area.city;
    } else if ((latitude != null && longitude != null) && (locality == null && city == null)) {
      const rev = await this.geocodingService.reverseGeocode(latitude, longitude);
      if (rev) {
        locality = rev.locality;
        city = rev.city;
        const area = await this.areaService.getOrCreate(locality, city, { assessIfMissing: true });
        areaId = area.id;
      }
    }
    let nearbyAmenities = dto.nearbyAmenities;
    if (latitude != null && longitude != null && (nearbyAmenities == null || nearbyAmenities.length === 0)) {
      const nearby = await this.nearbyService.getNearby(latitude, longitude);
      if (nearby.length > 0) nearbyAmenities = nearby;
    }
    const result = await this.propertyRepo.create(
      { ...dto, latitude, longitude, areaId, locality, city, nearbyAmenities },
      createdByUserId,
      isFreeListing,
    );
    this.logger.debug('create exit', { method: 'create', id: result.id, isFreeListing });
    return result;
  }

  async update(
    id: string,
    dto: UpdatePropertyDto,
    requestingUserId: string,
    requestingUserRole: string,
  ): Promise<Property> {
    this.logger.debug('update entry', { method: 'update', id });
    const property = await this.findOne(id);
    this.assertOwnerOrAdmin(property, requestingUserId, requestingUserRole);
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
        if (geo.locality && dto.locality === undefined) (dto as { locality?: string }).locality = geo.locality;
        if (geo.city && dto.city === undefined) (dto as { city?: string }).city = geo.city;
      }
    }
    const lat = dto.latitude ?? property.latitude;
    const lng = dto.longitude ?? property.longitude;
    if (
      lat != null &&
      lng != null &&
      dto.areaId === undefined &&
      (dto.locality === undefined && dto.city === undefined) &&
      (property.areaId == null || dto.location !== undefined)
    ) {
      const rev = await this.geocodingService.reverseGeocode(Number(lat), Number(lng));
      if (rev) {
        (dto as { locality?: string }).locality = rev.locality;
        (dto as { city?: string }).city = rev.city;
        const area = await this.areaService.getOrCreate(rev.locality, rev.city, {
          assessIfMissing: true,
        });
        (dto as { areaId?: string }).areaId = area.id;
      }
    } else if (
      (dto.locality != null || dto.city != null) &&
      dto.areaId === undefined
    ) {
      const area = await this.areaService.getOrCreate(
        dto.locality ?? 'Unknown',
        dto.city ?? '',
        { assessIfMissing: true },
      );
      (dto as { areaId?: string }).areaId = area.id;
      if (dto.locality == null) (dto as { locality?: string }).locality = area.locality;
      if (dto.city == null) (dto as { city?: string }).city = area.city;
    }
    if (
      (dto.latitude != null || dto.longitude != null || property.latitude != null) &&
      (dto.nearbyAmenities === undefined && (property as { nearbyAmenities?: string[] }).nearbyAmenities == null)
    ) {
      const lat = dto.latitude ?? property.latitude;
      const lng = dto.longitude ?? property.longitude;
      if (lat != null && lng != null) {
        const nearby = await this.nearbyService.getNearby(Number(lat), Number(lng));
        if (nearby.length > 0) (dto as { nearbyAmenities?: string[] }).nearbyAmenities = nearby;
      }
    }
    const result = await this.propertyRepo.update(property, dto);
    this.logger.debug('update exit', { method: 'update', id });
    return result;
  }

  async remove(
    id: string,
    requestingUserId: string,
    requestingUserRole: string,
  ): Promise<boolean> {
    this.logger.debug('remove entry', { method: 'remove', id });
    const property = await this.findOne(id);
    this.assertOwnerOrAdmin(property, requestingUserId, requestingUserRole);
    const result = await this.propertyRepo.delete(id);
    this.logger.debug('remove exit', { method: 'remove', id, deleted: result });
    return result;
  }

  async changeStatus(
    id: string,
    status: 'draft' | 'active' | 'sold' | 'rented',
    requestingUserId: string,
    requestingUserRole: string,
  ): Promise<Property> {
    const property = await this.findOne(id);
    this.assertOwnerOrAdmin(property, requestingUserId, requestingUserRole);
    const allowed = ['draft', 'active', 'sold', 'rented'];
    if (!allowed.includes(status)) {
      throw new ValidationError(`Invalid status: ${status}`);
    }
    return this.propertyRepo.update(property, { status });
  }

  async getCount(): Promise<number> {
    return this.propertyRepo.count();
  }
}
