/**
 * @file enquiry.resolver.ts
 * @module enquiry
 * @description GraphQL resolver: sendEnquiry, myReceivedEnquiries, mySentEnquiries.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UnauthorizedException } from '@nestjs/common';
import { Enquiry } from '../entities/enquiry.entity';
import { EnquiryService } from '../services/enquiry.service';
import { CreateEnquiryInput } from '../dtos/create-enquiry.input';

interface GqlContext {
  req?: { user?: { sub: string } };
}

@Resolver(() => Enquiry)
export class EnquiryResolver {
  constructor(private readonly enquiryService: EnquiryService) {}

  @Mutation(() => Enquiry, { name: 'sendEnquiry' })
  async sendEnquiry(
    @Args('input') input: CreateEnquiryInput,
    @Context() ctx: GqlContext,
  ): Promise<Enquiry> {
    const userId = ctx.req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Sign in required');
    return this.enquiryService.send(userId, input);
  }

  @Query(() => [Enquiry], { name: 'myReceivedEnquiries' })
  async myReceivedEnquiries(@Context() ctx: GqlContext): Promise<Enquiry[]> {
    const userId = ctx.req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Sign in required');
    return this.enquiryService.myReceived(userId);
  }

  @Query(() => [Enquiry], { name: 'mySentEnquiries' })
  async mySentEnquiries(@Context() ctx: GqlContext): Promise<Enquiry[]> {
    const userId = ctx.req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Sign in required');
    return this.enquiryService.mySent(userId);
  }
}
