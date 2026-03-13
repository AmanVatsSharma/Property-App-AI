/**
 * @file agent.resolver.ts
 * @module agent
 * @description GraphQL resolver: askAgent (sync or async when queue enabled), scoreProperty, agentJobStatus.
 * @author BharatERP
 * @created 2025-03-11
 */

import { Resolver, Mutation, Query, Args, Context, UseGuards } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';
import { AgentRateLimitGuard } from '@api/common/guards/agent-rate-limit.guard';
import { AgentOrchestratorService } from '../services/agent-orchestrator.service';
import { AgentToolsService } from '../services/agent-tools.service';
import { AgentQueueService } from '../services/agent-queue.service';
import { AskAgentInput } from '../dtos/ask-agent-input.dto';
import { AskAgentResult } from '../dtos/ask-agent-result.dto';
import { AskAgentAsyncResult } from '../dtos/ask-agent-async-result.dto';
import { AgentJobStatusResult } from '../dtos/agent-job-status.dto';
import { LoggerService } from '@api/shared/logger';
import { Property } from '@api/modules/property/entities/property.entity';
import { createUnionType } from '@nestjs/graphql';

export const AgentAskResponseUnion = createUnionType({
  name: 'AgentAskResponse',
  types: () => [AskAgentResult, AskAgentAsyncResult] as const,
  resolveType(value: AskAgentResult | AskAgentAsyncResult) {
    if ('jobId' in value) return AskAgentAsyncResult;
    return AskAgentResult;
  },
});

interface GraphQLContext {
  req?: { user?: { sub: string } };
  requestId?: string;
}

@Resolver()
@UseGuards(AgentRateLimitGuard)
export class AgentResolver {
  constructor(
    private readonly orchestrator: AgentOrchestratorService,
    private readonly tools: AgentToolsService,
    private readonly queue: AgentQueueService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  @Mutation(() => AgentAskResponseUnion, { name: 'askAgent' })
  async askAgent(
    @Args('input') input: AskAgentInput,
    @Context() ctx?: GraphQLContext,
  ): Promise<AskAgentResult | AskAgentAsyncResult> {
    const requestId = ctx?.requestId;
    const userId = ctx?.req?.user?.sub ?? null;
    this.logger.debug('askAgent mutation entry', { method: 'askAgent', requestId, userId: userId ?? 'anonymous' });
    const queueEnabled = this.config.get<boolean>('AGENT_QUEUE_ENABLED') === true && this.config.get<string>('REDIS_URL');
    if (queueEnabled) {
      const jobId = await this.queue.addJob({ input, requestId, userId });
      this.logger.debug('askAgent queued', { method: 'askAgent', requestId, jobId });
      return { jobId };
    }
    const result = await this.orchestrator.ask(input, requestId, userId);
    this.logger.debug('askAgent mutation exit', { method: 'askAgent', requestId });
    return result;
  }

  @Query(() => AgentJobStatusResult, { name: 'agentJobStatus' })
  async agentJobStatus(@Args('jobId') jobId: string): Promise<AgentJobStatusResult> {
    return this.queue.getJobStatus(jobId);
  }

  @Mutation(() => Property, { name: 'scoreProperty', nullable: true })
  async scoreProperty(@Args('propertyId') propertyId: string): Promise<Property> {
    this.logger.debug('scoreProperty mutation entry', { method: 'scoreProperty', propertyId });
    const property = await this.tools.scoreAndPersistProperty(propertyId);
    this.logger.debug('scoreProperty mutation exit', { method: 'scoreProperty', propertyId });
    return property;
  }
}
