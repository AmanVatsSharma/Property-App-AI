/**
 * @file property.resolver.ts
 * @module property
 * @description GraphQL resolver: properties, property(id), createProperty, updateProperty, deleteProperty.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { Property } from '../entities/property.entity';
import { PropertyService } from '../services/property.service';
import { CreatePropertyDto } from '../dtos/create-property.dto';
import { UpdatePropertyDto } from '../dtos/update-property.dto';
import { PropertyFilterDto } from '../dtos/property-filter.dto';
import { LoggerService } from '../../../shared/logger';

interface GqlContext {
  req?: { user?: { sub: string } };
}

@Resolver(() => Property)
export class PropertyResolver {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly logger: LoggerService,
  ) {}

  @Query(() => [Property], { name: 'properties' })
  async properties(@Args() filter: PropertyFilterDto): Promise<Property[]> {
    this.logger.debug('properties query entry', { method: 'properties' });
    const result = await this.propertyService.findAll(filter);
    this.logger.debug('properties query exit', { method: 'properties' });
    return result;
  }

  @Query(() => Property, { name: 'property', nullable: true })
  async property(@Args('id') id: string): Promise<Property> {
    this.logger.debug('property query entry', { method: 'property', id });
    const result = await this.propertyService.findOne(id);
    this.logger.debug('property query exit', { method: 'property', id });
    return result;
  }

  @Mutation(() => Property)
  async createProperty(
    @Args('input') input: CreatePropertyDto,
    @Context() ctx: GqlContext,
  ): Promise<Property> {
    const userId = ctx.req?.user?.sub ?? null;
    this.logger.debug('createProperty mutation entry', { method: 'createProperty', userId });
    const result = await this.propertyService.create(input, userId);
    this.logger.debug('createProperty mutation exit', { method: 'createProperty' });
    return result;
  }

  @Mutation(() => Property)
  async updateProperty(
    @Args('id') id: string,
    @Args('input') input: UpdatePropertyDto,
  ): Promise<Property> {
    this.logger.debug('updateProperty mutation entry', { method: 'updateProperty', id });
    const result = await this.propertyService.update(id, input);
    this.logger.debug('updateProperty mutation exit', { method: 'updateProperty', id });
    return result;
  }

  @Mutation(() => Boolean)
  async deleteProperty(@Args('id') id: string): Promise<boolean> {
    this.logger.debug('deleteProperty mutation entry', { method: 'deleteProperty', id });
    const result = await this.propertyService.remove(id);
    this.logger.debug('deleteProperty mutation exit', { method: 'deleteProperty', id });
    return result;
  }
}
