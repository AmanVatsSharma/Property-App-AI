/**
 * @file ask-agent-result.dto.ts
 * @module agent
 * @description GraphQL result type for askAgent; answer, sources, suggested actions.
 * @author BharatERP
 * @created 2025-03-11
 */

import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class AgentSource {
  @Field(() => String, { description: 'Tool or resource that contributed to the answer' })
  type: string;

  @Field(() => String, { description: 'Human-readable label' })
  label: string;

  @Field(() => String, { nullable: true, description: 'Related entity ID e.g. property id' })
  id?: string;
}

@ObjectType()
export class AgentSuggestedAction {
  @Field(() => String, { description: 'Action label e.g. View property' })
  label: string;

  @Field(() => String, { nullable: true, description: 'Target path or entity id' })
  target?: string;
}

@ObjectType()
export class AskAgentResult {
  @Field(() => String, { description: 'Final answer text from the agent' })
  answer: string;

  @Field(() => String, {
    nullable: true,
    description: 'Persisted conversation ID when conversation persistence is used',
  })
  conversationId?: string;

  @Field(() => [AgentSource], {
    defaultValue: [],
    description: 'Sources (tools used, property ids, etc.)',
  })
  sources: AgentSource[];

  @Field(() => [AgentSuggestedAction], {
    defaultValue: [],
    description: 'Suggested follow-up actions',
  })
  suggestedActions: AgentSuggestedAction[];
}
