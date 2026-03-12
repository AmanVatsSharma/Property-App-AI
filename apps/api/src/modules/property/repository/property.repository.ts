/**
 * @file property.repository.ts
 * @module property
 * @description Data access for Property entity; findById, findAllWithFilters, create, update, delete.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../entities/property.entity';
import { CreatePropertyDto } from '../dtos/create-property.dto';
import { UpdatePropertyDto } from '../dtos/update-property.dto';
import { PropertyFilterDto } from '../dtos/property-filter.dto';

@Injectable()
export class PropertyRepository {
  constructor(
    @InjectRepository(Property)
    private readonly repo: Repository<Property>,
  ) {}

  async findAllWithFilters(filter: PropertyFilterDto): Promise<Property[]> {
    const qb = this.repo.createQueryBuilder('p');
    if (filter.type) {
      qb.andWhere('p.type = :type', { type: filter.type });
    }
    if (filter.location) {
      qb.andWhere('p.location ILIKE :location', {
        location: `%${filter.location}%`,
      });
    }
    const hasBounds =
      filter.minLat != null &&
      filter.maxLat != null &&
      filter.minLng != null &&
      filter.maxLng != null;
    if (hasBounds) {
      qb.andWhere('p.latitude IS NOT NULL AND p.longitude IS NOT NULL');
      qb.andWhere('p.latitude >= :minLat', { minLat: filter.minLat });
      qb.andWhere('p.latitude <= :maxLat', { maxLat: filter.maxLat });
      qb.andWhere('p.longitude >= :minLng', { minLng: filter.minLng });
      qb.andWhere('p.longitude <= :maxLng', { maxLng: filter.maxLng });
    }
    if (filter.minPrice != null) {
      qb.andWhere('p.price >= :minPrice', { minPrice: filter.minPrice });
    }
    if (filter.maxPrice != null) {
      qb.andWhere('p.price <= :maxPrice', { maxPrice: filter.maxPrice });
    }
    if (filter.bedrooms != null) {
      qb.andWhere('p.bedrooms = :bedrooms', { bedrooms: filter.bedrooms });
    }
    qb.orderBy('p.createdAt', 'DESC');
    qb.take(filter.limit ?? 20);
    qb.skip(filter.offset ?? 0);
    return qb.getMany();
  }

  async findById(id: string): Promise<Property | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreatePropertyDto, createdByUserId?: string | null): Promise<Property> {
    const entity = this.repo.create({
      title: dto.title,
      location: dto.location,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      price: dto.price,
      type: dto.type ?? 'apartment',
      bedrooms: dto.bedrooms ?? 0,
      bathrooms: dto.bathrooms ?? 0,
      areaSqft: dto.areaSqft ?? null,
      status: dto.status ?? null,
      listingFor: dto.listingFor ?? null,
      specs: dto.specs ?? null,
      aiTip: dto.aiTip ?? null,
      aiScore: dto.aiScore ?? null,
      coverImageUrl: dto.coverImageUrl ?? null,
      imageUrls: dto.imageUrls ?? null,
      createdByUserId: createdByUserId ?? null,
    });
    return this.repo.save(entity);
  }

  async update(entity: Property, dto: UpdatePropertyDto): Promise<Property> {
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async count(): Promise<number> {
    return this.repo.count();
  }
}
