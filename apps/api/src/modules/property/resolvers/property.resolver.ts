/**
 * @file property.resolver.ts
 * @module property
 * @description GraphQL resolver: properties, property(id), createProperty, updateProperty, deleteProperty.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UnauthorizedException } from '@nestjs/common';
import { Property } from '../entities/property.entity';
import { PropertyService } from '../services/property.service';
import { SearchParserService } from '@api/modules/search/services/search-parser.service';
import { CreatePropertyDto } from '../dtos/create-property.dto';
import { UpdatePropertyDto } from '../dtos/update-property.dto';
import { PropertyFilterDto } from '../dtos/property-filter.dto';
import { PropertiesPage } from '../dtos/properties-page.dto';
import { LoggerService } from '@api/shared/logger';

interface GqlContext {
  req?: { user?: { sub: string; role: string } };
}

@Resolver(() => Property)
export class PropertyResolver {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly searchParser: SearchParserService,
    private readonly logger: LoggerService,
  ) {}

  @Query(() => [Property], { name: 'properties' })
  async properties(@Args() filter: PropertyFilterDto): Promise<Property[]> {
    this.logger.debug('properties query entry', { method: 'properties' });
    const result = await this.propertyService.findAll(filter);
    this.logger.debug('properties query exit', { method: 'properties' });
    return result;
  }

  @Query(() => PropertiesPage, { name: 'propertiesPage' })
  async propertiesPage(@Args() filter: PropertyFilterDto): Promise<PropertiesPage> {
    return this.propertyService.findAllPage(filter);
  }

  @Query(() => [Property], { name: 'searchPropertiesByQuery' })
  async searchPropertiesByQuery(@Args('query', { type: () => String }) query: string): Promise<Property[]> {
    this.logger.debug('searchPropertiesByQuery entry', { method: 'searchPropertiesByQuery' });
    const parsed = await this.searchParser.parse(query);
    const filter = {
      ...(parsed.location && { location: parsed.location }),
      ...(parsed.bedrooms != null && { bedrooms: parsed.bedrooms }),
      ...(parsed.minPrice != null && { minPrice: parsed.minPrice }),
      ...(parsed.maxPrice != null && { maxPrice: parsed.maxPrice }),
      ...(parsed.type && { type: parsed.type }),
      ...(parsed.schoolsScoreMin != null && { schoolsScoreMin: parsed.schoolsScoreMin }),
      ...(parsed.connectivityScoreMin != null && { connectivityScoreMin: parsed.connectivityScoreMin }),
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
      limit: 20,
      offset: 0,
    };
    const result = await this.propertyService.findAll(filter);
    this.logger.debug('searchPropertiesByQuery exit', { method: 'searchPropertiesByQuery', count: result.length });
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
    @Context() ctx: GqlContext,
  ): Promise<Property> {
    const userId = ctx.req?.user?.sub;
    const role = ctx.req?.user?.role;
    if (!userId) throw new UnauthorizedException('Sign in required');
    this.logger.debug('updateProperty mutation entry', { method: 'updateProperty', id });
    const result = await this.propertyService.update(id, input, userId, role);
    this.logger.debug('updateProperty mutation exit', { method: 'updateProperty', id });
    return result;
  }

  @Mutation(() => Boolean)
  async deleteProperty(
    @Args('id') id: string,
    @Context() ctx: GqlContext,
  ): Promise<boolean> {
    const userId = ctx.req?.user?.sub;
    const role = ctx.req?.user?.role;
    if (!userId) throw new UnauthorizedException('Sign in required');
    this.logger.debug('deleteProperty mutation entry', { method: 'deleteProperty', id });
    const result = await this.propertyService.remove(id, userId, role);
    this.logger.debug('deleteProperty mutation exit', { method: 'deleteProperty', id });
    return result;
  }

  @Mutation(() => Property, { name: 'changePropertyStatus' })
  async changePropertyStatus(
    @Args('id') id: string,
    @Args('status') status: string,
    @Context() ctx: GqlContext,
  ): Promise<Property> {
    const userId = ctx.req?.user?.sub;
    const role = ctx.req?.user?.role;
    if (!userId) throw new UnauthorizedException('Sign in required');
    return this.propertyService.changeStatus(id, status as 'draft' | 'active' | 'sold' | 'rented', userId, role);
  }
}
