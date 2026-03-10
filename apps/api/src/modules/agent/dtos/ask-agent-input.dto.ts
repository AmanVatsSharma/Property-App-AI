/**
 * @file ask-agent-input.dto.ts
 * @module agent
 * @description GraphQL input for askAgent mutation; prompt and optional context.
 * @author BharatERP
 * @created 2025-03-11
 */

import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class AgentContextInput {
  @Field({ nullable: true, description: 'Property ID when question is about a specific listing' })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @Field({ nullable: true, description: 'Locality or city for neighbourhood/forecast questions' })
  @IsOptional()
  @IsString()
  locality?: string;

  @Field({ nullable: true, description: 'City name' })
  @IsOptional()
  @IsString()
  city?: string;
}

@InputType()
export class AskAgentInput {
  @Field({ description: 'User prompt in natural language' })
  @IsString()
  @MaxLength(4000)
  prompt: string;

  @Field(() => AgentContextInput, { nullable: true, description: 'Optional context (propertyId, locality, city)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AgentContextInput)
  context?: AgentContextInput;
}
