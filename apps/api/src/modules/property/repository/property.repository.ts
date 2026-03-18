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
    const hasAreaScoreFilter =
      filter.schoolsScoreMin != null || filter.connectivityScoreMin != null;
    if (hasAreaScoreFilter) {
      qb.innerJoin('area', 'a', 'a.id = p."areaId"');
      if (filter.schoolsScoreMin != null) {
        qb.andWhere(
          'a."schoolsScore" IS NOT NULL AND a."schoolsScore" >= :schoolsScoreMin',
          { schoolsScoreMin: filter.schoolsScoreMin },
        );
      }
      if (filter.connectivityScoreMin != null) {
        qb.andWhere(
          'a."connectivityScore" IS NOT NULL AND a."connectivityScore" >= :connectivityScoreMin',
          { connectivityScoreMin: filter.connectivityScoreMin },
        );
      }
    }
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
    const sortByMap: Record<string, string> = {
      createdAt: 'p.createdAt',
      price: 'p.price',
      aiScore: 'p.aiScore',
    };
    const sortField = sortByMap[filter.sortBy ?? ''] ?? 'p.createdAt';
    const sortOrder = (filter.sortOrder ?? 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    qb.orderBy(sortField, sortOrder as 'ASC' | 'DESC');
    qb.take(filter.limit ?? 20);
    qb.skip(filter.offset ?? 0);
    return qb.getMany();
  }

  async findById(id: string): Promise<Property | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreatePropertyDto, createdByUserId?: string | null, isFreeListing = true): Promise<Property> {
    const entity = this.repo.create({
      title: dto.title,
      location: dto.location,
      areaId: dto.areaId ?? null,
      locality: dto.locality ?? null,
      city: dto.city ?? null,
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
      nearbyAmenities: dto.nearbyAmenities ?? null,
      createdByUserId: createdByUserId ?? null,
      isFreeListing,
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

  async countByUserId(userId: string): Promise<number> {
    return this.repo.count({ where: { createdByUserId: userId } });
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.repo.increment({ id }, 'viewCount', 1);
  }

  async findPageWithFilters(filter: PropertyFilterDto): Promise<{
    items: Property[];
    nextCursor: string | null;
    total: number;
  }> {
    const limit = Math.min(filter.limit ?? 20, 100);
    const qb = this.repo.createQueryBuilder('p');
    const hasAreaScoreFilter =
      filter.schoolsScoreMin != null || filter.connectivityScoreMin != null;
    if (hasAreaScoreFilter) {
      qb.innerJoin('area', 'a', 'a.id = p."areaId"');
      if (filter.schoolsScoreMin != null) {
        qb.andWhere(
          'a."schoolsScore" IS NOT NULL AND a."schoolsScore" >= :schoolsScoreMin',
          { schoolsScoreMin: filter.schoolsScoreMin },
        );
      }
      if (filter.connectivityScoreMin != null) {
        qb.andWhere(
          'a."connectivityScore" IS NOT NULL AND a."connectivityScore" >= :connectivityScoreMin',
          { connectivityScoreMin: filter.connectivityScoreMin },
        );
      }
    }
    if (filter.type) qb.andWhere('p.type = :type', { type: filter.type });
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
    if (filter.minPrice != null) qb.andWhere('p.price >= :minPrice', { minPrice: filter.minPrice });
    if (filter.maxPrice != null) qb.andWhere('p.price <= :maxPrice', { maxPrice: filter.maxPrice });
    if (filter.bedrooms != null) qb.andWhere('p.bedrooms = :bedrooms', { bedrooms: filter.bedrooms });
    if (filter.after) {
      const afterDate = new Date(filter.after);
      if (!Number.isNaN(afterDate.getTime())) {
        qb.andWhere('p."createdAt" < :after', { after: afterDate });
      }
    }
    qb.orderBy('p.createdAt', 'DESC');
    qb.take(limit + 1);
    const result = await qb.getMany();
    const hasMore = result.length > limit;
    const items = hasMore ? result.slice(0, limit) : result;
    const nextCursor =
      hasMore && items.length > 0
        ? items[items.length - 1].createdAt.toISOString()
        : null;
    const countQb = this.repo.createQueryBuilder('p');
    if (hasAreaScoreFilter) {
      countQb.innerJoin('area', 'a', 'a.id = p."areaId"');
      if (filter.schoolsScoreMin != null) {
        countQb.andWhere(
          'a."schoolsScore" IS NOT NULL AND a."schoolsScore" >= :schoolsScoreMin',
          { schoolsScoreMin: filter.schoolsScoreMin },
        );
      }
      if (filter.connectivityScoreMin != null) {
        countQb.andWhere(
          'a."connectivityScore" IS NOT NULL AND a."connectivityScore" >= :connectivityScoreMin',
          { connectivityScoreMin: filter.connectivityScoreMin },
        );
      }
    }
    if (filter.type) countQb.andWhere('p.type = :type', { type: filter.type });
    if (filter.location) {
      countQb.andWhere('p.location ILIKE :location', {
        location: `%${filter.location}%`,
      });
    }
    if (hasBounds) {
      countQb.andWhere('p.latitude IS NOT NULL AND p.longitude IS NOT NULL');
      countQb.andWhere('p.latitude >= :minLat', { minLat: filter.minLat });
      countQb.andWhere('p.latitude <= :maxLat', { maxLat: filter.maxLat });
      countQb.andWhere('p.longitude >= :minLng', { minLng: filter.minLng });
      countQb.andWhere('p.longitude <= :maxLng', { maxLng: filter.maxLng });
    }
    if (filter.minPrice != null) countQb.andWhere('p.price >= :minPrice', { minPrice: filter.minPrice });
    if (filter.maxPrice != null) countQb.andWhere('p.price <= :maxPrice', { maxPrice: filter.maxPrice });
    if (filter.bedrooms != null) countQb.andWhere('p.bedrooms = :bedrooms', { bedrooms: filter.bedrooms });
    const total = await countQb.getCount();
    return { items, nextCursor, total };
  }
}
