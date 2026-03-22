/**
 * @file properties-page.dto.ts
 * @module property
 * @description GraphQL type for cursor-paginated property list.
 * @author BharatERP
 * @created 2026-03-18
 */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Property } from '../entities/property.entity';

@ObjectType()
export class PropertiesPage {
  @Field(() => [Property])
  items: Property[];

  @Field(() => String, { nullable: true, description: 'Cursor for next page; pass as "after" in next request' })
  nextCursor: string | null;

  @Field(() => Int, { description: 'Total count matching the filter' })
  total: number;
}
