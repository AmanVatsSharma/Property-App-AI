/**
 * @file ask-agent-async-result.dto.ts
 * @module agent
 * @description GraphQL type for async askAgent (when queue enabled): jobId for polling.
 * @author BharatERP
 * @created 2025-03-12
 */

import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AskAgentAsyncResult {
  @Field({ description: 'Job ID to poll for status/result via agentJobStatus' })
  jobId: string;
}
