/**
 * @file user.resolver.ts
 * @module user
 * @description GraphQL resolver: me (current user), updateMyProfile.
 * @author BharatERP
 * @created 2025-03-12
 */

import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { UpdateProfileInput } from '../dtos/update-profile.dto';

interface GqlContext {
  req?: { user?: { sub: string; phone?: string } };
}

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { name: 'me', nullable: true })
  async me(@Context() ctx: GqlContext): Promise<User | null> {
    const userId = ctx.req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Sign in to view profile');
    return this.userService.findById(userId);
  }

  @Mutation(() => User)
  async updateMyProfile(
    @Args('input') input: UpdateProfileInput,
    @Context() ctx: GqlContext,
  ): Promise<User> {
    const userId = ctx.req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Sign in to update profile');
    return this.userService.updateProfile(userId, { displayName: input.displayName });
  }
}
