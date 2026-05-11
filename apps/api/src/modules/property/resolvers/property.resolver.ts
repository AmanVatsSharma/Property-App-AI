/**
 * @file property.resolver.ts
 * @module property
 * @description GraphQL resolver: properties, property(id), createProperty, updateProperty, deleteProperty.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Resolver, Query, Mutation, Args, Context, ResolveField, Parent } from '@nestjs/graphql';
import { Int, Float, ObjectType, Field } from '@nestjs/graphql';
import { UnauthorizedException } from '@nestjs/common';
import { Property } from '../entities/property.entity';
import { PropertyService } from '../services/property.service';
import { Public } from '@api/common/decorators/public.decorator';
import { SearchParserService } from '@api/modules/search/services/search-parser.service';
import { CreatePropertyDto } from '../dtos/create-property.dto';
import { UpdatePropertyDto } from '../dtos/update-property.dto';
import { PropertyFilterDto } from '../dtos/property-filter.dto';
import { PropertiesPage } from '../dtos/properties-page.dto';
import { LoggerService } from '@api/shared/logger';
import { UserService } from '@api/modules/user/services/user.service';
import { AreaService } from '@api/modules/area/services/area.service';
import { PriceForecastService, PriceForecastResult } from '@api/modules/area/services/price-forecast.service';

@ObjectType()
class AreaScoresType {
  @Field(() => Float, { nullable: true }) livabilityScore?: number | null;
  @Field(() => Float, { nullable: true }) connectivityScore?: number | null;
  @Field(() => Float, { nullable: true }) schoolsScore?: number | null;
  @Field(() => Float, { nullable: true }) safetyScore?: number | null;
  @Field(() => Float, { nullable: true }) priceTrendPctAnnual?: number | null;
}

@ObjectType()
class PriceForecastResultType {
  @Field(() => String) locality: string;
  @Field(() => String) city: string;
  @Field(() => Float, { nullable: true }) currentPricePerSqft?: number | null;
  @Field(() => Float) forecast12m: number;
  @Field(() => Float) forecast24m: number;
  @Field(() => Float) forecast36m: number;
  @Field(() => String) demandSignal: string;
  @Field(() => String) rationale: string;
  @Field(() => String) confidence: string;
  @Field(() => String) lastUpdated: string;
}

interface GqlContext {
  req?: { user?: { sub: string; role: string } };
}

@Resolver(() => Property)
export class PropertyResolver {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly searchParser: SearchParserService,
    private readonly logger: LoggerService,
    private readonly userService: UserService,
    private readonly areaService: AreaService,
    private readonly priceForecast: PriceForecastService,
  ) {}

  @Public()
  @Query(() => [Property], { name: 'properties' })
  async properties(
    @Args('filter', { nullable: true, defaultValue: {}, type: () => PropertyFilterDto })
    filter: PropertyFilterDto,
  ): Promise<Property[]> {
    this.logger.debug('properties query entry', { method: 'properties' });
    const result = await this.propertyService.findAll(filter);
    this.logger.debug('properties query exit', { method: 'properties' });
    return result;
  }

  @Query(() => [Property], { name: 'myListings' })
  async myListings(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Context() ctx?: GqlContext,
  ): Promise<Property[]> {
    const userId = ctx?.req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Sign in required');
    this.logger.debug('myListings query entry', { method: 'myListings', userId });
    const result = await this.propertyService.findAll({
      createdByUserId: userId,
      limit: limit ?? 50,
      offset: offset ?? 0,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    this.logger.debug('myListings query exit', { method: 'myListings', count: result.length });
    return result;
  }

  @Public()
  @Query(() => PropertiesPage, { name: 'propertiesPage' })
  async propertiesPage(
    @Args('filter', { nullable: true, defaultValue: {}, type: () => PropertyFilterDto })
    filter: PropertyFilterDto,
  ): Promise<PropertiesPage> {
    return this.propertyService.findAllPage(filter);
  }

  @Public()
  @Query(() => PropertiesPage, { name: 'propertiesCursor' })
  async propertiesCursor(
    @Args('cursor', { nullable: true }) cursor: string | undefined,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit: number | undefined,
    @Args('filter', { nullable: true, defaultValue: {}, type: () => PropertyFilterDto })
    filter: PropertyFilterDto,
  ): Promise<PropertiesPage> {
    const effectiveLimit = Math.min(limit ?? 20, 100);
    const pageFilter = { ...filter, cursor, limit: effectiveLimit };
    return this.propertyService.findAllPage(pageFilter);
  }

  @Public()
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

  @Public()
  @Query(() => Property, { name: 'property', nullable: true })
  async property(@Args('id', { type: () => String }) id: string): Promise<Property> {
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
    @Args('id', { type: () => String }) id: string,
    @Args('input', { type: () => UpdatePropertyDto }) input: UpdatePropertyDto,
    @Context() ctx: GqlContext,
  ): Promise<Property> {
    const userId = ctx.req?.user?.sub;
    const role = ctx.req?.user?.role ?? 'user';
    if (!userId) throw new UnauthorizedException('Sign in required');
    this.logger.debug('updateProperty mutation entry', { method: 'updateProperty', id });
    const result = await this.propertyService.update(id, input, userId, role);
    this.logger.debug('updateProperty mutation exit', { method: 'updateProperty', id });
    return result;
  }

  @Mutation(() => Boolean)
  async deleteProperty(
    @Args('id', { type: () => String }) id: string,
    @Context() ctx: GqlContext,
  ): Promise<boolean> {
    const userId = ctx.req?.user?.sub;
    const role = ctx.req?.user?.role ?? 'user';
    if (!userId) throw new UnauthorizedException('Sign in required');
    this.logger.debug('deleteProperty mutation entry', { method: 'deleteProperty', id });
    const result = await this.propertyService.remove(id, userId, role);
    this.logger.debug('deleteProperty mutation exit', { method: 'deleteProperty', id });
    return result;
  }

  @Mutation(() => Property, { name: 'changePropertyStatus' })
  async changePropertyStatus(
    @Args('id', { type: () => String }) id: string,
    @Args('status', { type: () => String }) status: string,
    @Context() ctx: GqlContext,
  ): Promise<Property> {
    const userId = ctx.req?.user?.sub;
    const role = ctx.req?.user?.role ?? 'user';
    if (!userId) throw new UnauthorizedException('Sign in required');
    return this.propertyService.changeStatus(id, status as 'draft' | 'active' | 'sold' | 'rented', userId, role);
  }

  @ResolveField(() => String, { nullable: true })
  async ownerName(@Parent() property: Property): Promise<string | null> {
    if (!property.createdByUserId) return null;
    const user = await this.userService.findById(property.createdByUserId);
    return user?.displayName ?? null;
  }

  @ResolveField(() => String, { nullable: true })
  async ownerPhone(@Parent() property: Property): Promise<string | null> {
    if (!property.createdByUserId) return null;
    const user = await this.userService.findById(property.createdByUserId);
    if (!user?.phone) return null;
    const last4 = user.phone.slice(-4);
    return `+91 XXXXXX${last4}`;
  }

  @Public()
  @Query(() => PriceForecastResultType, { name: 'propertyPriceForecast', nullable: true })
  async propertyPriceForecast(
    @Args('propertyId', { type: () => String }) propertyId: string,
  ): Promise<PriceForecastResult | null> {
    const property = await this.propertyService.findOne(propertyId);
    if (!property) return null;
    const locality = property.locality ?? property.location ?? '';
    const city = property.city ?? '';
    return this.priceForecast.getForecast(locality, city);
  }

  @ResolveField(() => AreaScoresType, { nullable: true })
  async areaScores(@Parent() property: Property): Promise<AreaScoresType | null> {
    if (!property.areaId) return null;
    const area = await this.areaService.findById(property.areaId);
    if (!area) return null;
    return {
      livabilityScore: area.livabilityScore,
      connectivityScore: area.connectivityScore,
      schoolsScore: area.schoolsScore,
      safetyScore: area.safetyScore,
      priceTrendPctAnnual: area.priceTrendPctAnnual,
    };
  }
}
