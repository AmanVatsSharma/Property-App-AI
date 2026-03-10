/**
 * @file property.resolver.ts
 * @module property
 * @description GraphQL resolver: properties, property(id), createProperty, updateProperty, deleteProperty.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Property } from './entities/property.entity';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyFilterDto } from './dto/property-filter.dto';

@Resolver(() => Property)
export class PropertyResolver {
  constructor(private readonly propertyService: PropertyService) {}

  @Query(() => [Property], { name: 'properties' })
  async properties(
    @Args() filter: PropertyFilterDto,
  ): Promise<Property[]> {
    return this.propertyService.findAll(filter);
  }

  @Query(() => Property, { name: 'property', nullable: true })
  async property(@Args('id') id: string): Promise<Property> {
    return this.propertyService.findOne(id);
  }

  @Mutation(() => Property)
  async createProperty(
    @Args('input') input: CreatePropertyDto,
  ): Promise<Property> {
    return this.propertyService.create(input);
  }

  @Mutation(() => Property)
  async updateProperty(
    @Args('id') id: string,
    @Args('input') input: UpdatePropertyDto,
  ): Promise<Property> {
    return this.propertyService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteProperty(@Args('id') id: string): Promise<boolean> {
    return this.propertyService.remove(id);
  }
}
