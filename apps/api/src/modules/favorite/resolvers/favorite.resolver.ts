/**
 * @file favorite.resolver.ts
 * @module favorite
 * @description GraphQL resolver: toggleFavorite, myFavorites.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UnauthorizedException } from '@nestjs/common';
import { Favorite } from '../entities/favorite.entity';
import { FavoriteService } from '../services/favorite.service';
import { ToggleFavoriteResult } from '../dtos/toggle-favorite-result.dto';

interface GqlContext {
  req?: { user?: { sub: string } };
}

@Resolver(() => Favorite)
export class FavoriteResolver {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Mutation(() => ToggleFavoriteResult)
  async toggleFavorite(
    @Args('propertyId') propertyId: string,
    @Context() ctx: GqlContext,
  ): Promise<ToggleFavoriteResult> {
    const userId = ctx.req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Sign in required');
    return this.favoriteService.toggle(userId, propertyId);
  }

  @Query(() => [Favorite], { name: 'myFavorites' })
  async myFavorites(@Context() ctx: GqlContext): Promise<Favorite[]> {
    const userId = ctx.req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Sign in required');
    return this.favoriteService.myFavorites(userId);
  }
}
