/**
 * @file review-broker-request.input.ts
 * @module broker
 * @description GraphQL input for admin review of broker request.
 * @author BharatERP
 * @created 2026-03-18
 */

import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsIn, IsOptional } from 'class-validator';

@InputType()
export class ReviewBrokerRequestInput {
  @Field(() => String, { description: 'Broker request ID' })
  @IsString()
  requestId: string;

  @Field(() => String, { description: 'approve or reject' })
  @IsString()
  @IsIn(['approve', 'reject'])
  action: 'approve' | 'reject';

  @Field(() => String, { nullable: true, description: 'Admin note (e.g. reason for rejection)' })
  @IsOptional()
  @IsString()
  adminNote?: string;
}
