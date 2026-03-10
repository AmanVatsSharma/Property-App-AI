/**
 * @file property.service.ts
 * @module property
 * @description Business logic for property CRUD and list/search; delegates to repository.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Injectable } from '@nestjs/common';
import { Property } from '../entities/property.entity';
import { CreatePropertyDto } from '../dtos/create-property.dto';
import { UpdatePropertyDto } from '../dtos/update-property.dto';
import { PropertyFilterDto } from '../dtos/property-filter.dto';
import { PropertyNotFoundError } from '../../../common/errors';
import { PropertyRepository } from '../repository/property.repository';
import { LoggerService } from '../../../shared/logger';

@Injectable()
export class PropertyService {
  constructor(
    private readonly propertyRepo: PropertyRepository,
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

  async create(dto: CreatePropertyDto): Promise<Property> {
    this.logger.debug('create entry', { method: 'create' });
    const result = await this.propertyRepo.create(dto);
    this.logger.debug('create exit', { method: 'create', id: result.id });
    return result;
  }

  async update(id: string, dto: UpdatePropertyDto): Promise<Property> {
    this.logger.debug('update entry', { method: 'update', id });
    const property = await this.findOne(id);
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
}
