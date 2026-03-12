/**
 * @file agent-job-status.dto.ts
 * @module agent
 * @description GraphQL type for agent job status polling (completed, active, waiting, etc.).
 * @author BharatERP
 * @created 2025-03-12
 */

import { ObjectType, Field } from '@nestjs/graphql';
import { AskAgentResult } from './ask-agent-result.dto';

@ObjectType()
export class AgentJobStatusResult {
  @Field({ description: 'Job state: waiting, active, completed, failed, not_found' })
  status: string;

  @Field(() => AskAgentResult, { nullable: true, description: 'Result when status is completed' })
  result?: AskAgentResult;
}
