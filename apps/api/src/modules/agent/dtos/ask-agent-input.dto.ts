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
  @Field(() => String, { nullable: true, description: 'Property ID when question is about a specific listing' })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Locality or city for neighbourhood/forecast questions',
  })
  @IsOptional()
  @IsString()
  locality?: string;

  @Field(() => String, { nullable: true, description: 'City name' })
  @IsOptional()
  @IsString()
  city?: string;
}

@InputType()
export class ConversationMessageInput {
  @Field(() => String)
  @IsString()
  role: 'user' | 'assistant';

  @Field(() => String)
  @IsString()
  content: string;
}

@InputType()
export class AskAgentInput {
  @Field(() => String, { description: 'User prompt in natural language' })
  @IsString()
  @MaxLength(4000)
  prompt: string;

  @Field(() => AgentContextInput, { nullable: true, description: 'Optional context (propertyId, locality, city)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AgentContextInput)
  context?: AgentContextInput;

  @Field(() => [ConversationMessageInput], {
    nullable: true,
    description: 'Previous messages in this conversation for multi-turn context',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessageInput)
  conversationHistory?: ConversationMessageInput[];
}
