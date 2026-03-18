/**
 * @file notification.resolver.ts
 * @module notification
 * @description GraphQL resolver: myNotifications, markNotificationRead, markAllNotificationsRead.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UnauthorizedException } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';
import { NotificationService } from '../services/notification.service';
import { Int } from '@nestjs/graphql';

interface GqlContext {
  req?: { user?: { sub: string } };
}

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Query(() => [Notification], { name: 'myNotifications' })
  async myNotifications(
    @Args('limit', { type: () => Int, nullable: true }) limit: number | undefined,
    @Args('offset', { type: () => Int, nullable: true }) offset: number | undefined,
    @Context() ctx: GqlContext,
  ): Promise<Notification[]> {
    const userId = ctx.req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Sign in required');
    return this.notificationService.myNotifications(userId, limit ?? 20, offset ?? 0);
  }

  @Mutation(() => Notification, { name: 'markNotificationRead', nullable: true })
  async markNotificationRead(
    @Args('id') id: string,
    @Context() ctx: GqlContext,
  ): Promise<Notification | null> {
    const userId = ctx.req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Sign in required');
    return this.notificationService.markRead(id, userId);
  }

  @Mutation(() => Boolean, { name: 'markAllNotificationsRead' })
  async markAllNotificationsRead(@Context() ctx: GqlContext): Promise<boolean> {
    const userId = ctx.req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Sign in required');
    await this.notificationService.markAllRead(userId);
    return true;
  }
}
