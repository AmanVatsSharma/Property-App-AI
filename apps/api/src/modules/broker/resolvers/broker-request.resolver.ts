/**
 * @file broker-request.resolver.ts
 * @module broker
 * @description GraphQL resolver: requestBrokerVerification, reviewBrokerRequest.
 * @author BharatERP
 * @created 2026-03-18
 */

import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { BrokerRequest } from '../entities/broker-request.entity';
import { BrokerRequestService } from '../services/broker-request.service';
import { AdminGuard } from '@api/common/guards/admin.guard';
import { RequestBrokerVerificationInput } from '../dtos/request-broker-verification.input';
import { ReviewBrokerRequestInput } from '../dtos/review-broker-request.input';

interface GqlContext {
  req?: { user?: { sub: string } };
}

@Resolver(() => BrokerRequest)
export class BrokerRequestResolver {
  constructor(private readonly brokerRequestService: BrokerRequestService) {}

  @Mutation(() => BrokerRequest, { name: 'requestBrokerVerification' })
  async requestBrokerVerification(
    @Args('input', { nullable: true }) input: RequestBrokerVerificationInput | undefined,
    @Context() ctx: GqlContext,
  ): Promise<BrokerRequest> {
    const userId = ctx.req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Sign in required');
    return this.brokerRequestService.requestBrokerVerification(userId, input);
  }

  @Mutation(() => BrokerRequest, { name: 'reviewBrokerRequest' })
  @UseGuards(AdminGuard)
  async reviewBrokerRequest(
    @Args('input') input: ReviewBrokerRequestInput,
    @Context() ctx: GqlContext,
  ): Promise<BrokerRequest> {
    const adminUserId = ctx.req?.user?.sub;
    if (!adminUserId) throw new UnauthorizedException('Sign in required');
    if (input.action === 'approve') {
      return this.brokerRequestService.approveBrokerRequest(input.requestId, adminUserId);
    }
    return this.brokerRequestService.rejectBrokerRequest(
      input.requestId,
      adminUserId,
      input.adminNote ?? null,
    );
  }
}
