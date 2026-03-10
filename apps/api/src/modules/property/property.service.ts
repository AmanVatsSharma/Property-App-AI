/**
 * @file property.service.ts
 * @module property
 * @description Business logic for property CRUD and list/search.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyFilterDto } from './dto/property-filter.dto';
import { PropertyNotFoundError } from '../../common/errors';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) {}

  async findAll(filter: PropertyFilterDto): Promise<Property[]> {
    const qb = this.propertyRepo.createQueryBuilder('p');
    if (filter.type) {
      qb.andWhere('p.type = :type', { type: filter.type });
    }
    if (filter.location) {
      qb.andWhere('p.location ILIKE :location', {
        location: `%${filter.location}%`,
      });
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

  async findOne(id: string): Promise<Property> {
    const property = await this.propertyRepo.findOne({ where: { id } });
    if (!property) {
      throw new PropertyNotFoundError(id);
    }
    return property;
  }

  async create(dto: CreatePropertyDto): Promise<Property> {
    const entity = this.propertyRepo.create({
      title: dto.title,
      location: dto.location,
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
    });
    return this.propertyRepo.save(entity);
  }

  async update(id: string, dto: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id);
    Object.assign(property, dto);
    return this.propertyRepo.save(property);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.propertyRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
