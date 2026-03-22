/**
 * @file saved-search.resolver.ts
 * @module saved-search
 * @description GraphQL resolver for saved searches (CRUD, auth-required).
 * @author BharatERP
 * @created 2026-03-19
 */

import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UnauthorizedException } from '@nestjs/common';
import { SavedSearch } from '../entities/saved-search.entity';
import { SavedSearchService } from '../services/saved-search.service';
import { CreateSavedSearchInput, UpdateSavedSearchInput } from '../dtos/saved-search.dto';

interface GqlContext {
  req?: { user?: { sub: string } };
}

@Resolver(() => SavedSearch)
export class SavedSearchResolver {
  constructor(private readonly savedSearchService: SavedSearchService) {}

  @Query(() => [SavedSearch], { name: 'mySavedSearches' })
  async mySavedSearches(@Context() ctx: GqlContext): Promise<SavedSearch[]> {
    const userId = ctx.req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Sign in required');
    return this.savedSearchService.findByUser(userId);
  }

  @Mutation(() => SavedSearch, { name: 'createSavedSearch' })
  async createSavedSearch(
    @Args('input', { type: () => CreateSavedSearchInput }) input: CreateSavedSearchInput,
    @Context() ctx: GqlContext,
  ): Promise<SavedSearch> {
    const userId = ctx.req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Sign in required');
    return this.savedSearchService.create(userId, input);
  }

  @Mutation(() => SavedSearch, { name: 'updateSavedSearch' })
  async updateSavedSearch(
    @Args('id', { type: () => String }) id: string,
    @Args('input', { type: () => UpdateSavedSearchInput }) input: UpdateSavedSearchInput,
    @Context() ctx: GqlContext,
  ): Promise<SavedSearch> {
    const userId = ctx.req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Sign in required');
    return this.savedSearchService.update(id, userId, input);
  }

  @Mutation(() => Boolean, { name: 'deleteSavedSearch' })
  async deleteSavedSearch(
    @Args('id', { type: () => String }) id: string,
    @Context() ctx: GqlContext,
  ): Promise<boolean> {
    const userId = ctx.req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Sign in required');
    return this.savedSearchService.delete(id, userId);
  }
}
