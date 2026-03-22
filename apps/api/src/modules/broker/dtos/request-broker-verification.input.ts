/**
 * @file request-broker-verification.input.ts
 * @module broker
 * @description GraphQL input for requesting broker verification.
 * @author BharatERP
 * @created 2026-03-18
 */

import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class RequestBrokerVerificationInput {
  @Field(() => GraphQLJSON, { nullable: true, description: 'Optional documents (e.g. license) for verification' })
  @IsOptional()
  documents?: Record<string, unknown>;
}
