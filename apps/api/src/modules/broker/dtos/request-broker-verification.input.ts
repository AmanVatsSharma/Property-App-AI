/**
 * @file request-broker-verification.input.ts
 * @module broker
 * @description GraphQL input for requesting broker verification.
 * @author BharatERP
 * @created 2026-03-18
 */

import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { JsonScalar } from '@api/shared/scalars/json.scalar';

@InputType()
export class RequestBrokerVerificationInput {
  @Field(() => JsonScalar, { nullable: true, description: 'Optional documents (e.g. license) for verification' })
  @IsOptional()
  documents?: Record<string, unknown>;
}
