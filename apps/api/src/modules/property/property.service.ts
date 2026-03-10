/**
 * @file property.service.ts
 * @module property
 * @description Business logic for property CRUD and list/search; delegates to repository.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Injectable } from '@nestjs/common';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyFilterDto } from './dto/property-filter.dto';
import { PropertyNotFoundError } from '../../common/errors';
import { PropertyRepository } from './repository/property.repository';

@Injectable()
export class PropertyService {
  constructor(private readonly propertyRepo: PropertyRepository) {}

  async findAll(filter: PropertyFilterDto): Promise<Property[]> {
    return this.propertyRepo.findAllWithFilters(filter);
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertyRepo.findById(id);
    if (!property) {
      throw new PropertyNotFoundError(id);
    }
    return property;
  }

  async create(dto: CreatePropertyDto): Promise<Property> {
    return this.propertyRepo.create(dto);
  }

  async update(id: string, dto: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id);
    return this.propertyRepo.update(property, dto);
  }

  async remove(id: string): Promise<boolean> {
    return this.propertyRepo.delete(id);
  }
}
