/**
 * @file toggle-favorite-result.dto.ts
 * @module favorite
 * @description GraphQL result type for toggleFavorite mutation.
 * @author BharatERP
 * @created 2026-03-18
 */

import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ToggleFavoriteResult {
  @Field(() => Boolean)
  saved: boolean;
}
