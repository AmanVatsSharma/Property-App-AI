/**
 * @file agent.resolver.ts
 * @module agent
 * @description GraphQL resolver: askAgent (sync or async when queue enabled), scoreProperty, agentJobStatus.
 * @author BharatERP
 * @created 2025-03-11
 */

import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
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
import { ConversationService } from '../conversation/services/conversation.service';
import { AgentConversation } from '../conversation/entities/agent-conversation.entity';

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
    private readonly conversationService: ConversationService,
  ) {}

  @Mutation(() => AgentAskResponseUnion, { name: 'askAgent' })
  async askAgent(
    @Args('input', { type: () => AskAgentInput }) input: AskAgentInput,
    @Args('conversationId', { nullable: true, type: () => String }) conversationId: string | undefined,
    @Context() ctx?: GraphQLContext,
  ): Promise<AskAgentResult | AskAgentAsyncResult> {
    const requestId = ctx?.requestId;
    const userId = ctx?.req?.user?.sub ?? null;
    this.logger.debug('askAgent mutation entry', { method: 'askAgent', requestId, userId: userId ?? 'anonymous', conversationId });
    const queueEnabled = this.config.get<boolean>('AGENT_QUEUE_ENABLED') === true && this.config.get<string>('REDIS_URL');
    if (queueEnabled) {
      const jobId = await this.queue.addJob({ input, requestId, userId });
      this.logger.debug('askAgent queued', { method: 'askAgent', requestId, jobId });
      return { jobId };
    }
    let effectiveInput = input;
    let convId: string | undefined = conversationId ?? undefined;
    if (conversationId) {
      const conv = await this.conversationService.getConversation(conversationId);
      if (conv?.messages?.length) {
        effectiveInput = {
          ...input,
          conversationHistory: conv.messages.map((m) => ({ role: m.role, content: m.content })),
        };
      }
    }
    const result = await this.orchestrator.ask(effectiveInput, requestId, userId);
    if (!convId) {
      const newConv = await this.conversationService.startConversation(userId);
      convId = newConv.id;
    }
    await this.conversationService.appendMessages(convId, [
      { role: 'user', content: input.prompt },
      { role: 'assistant', content: result.answer },
    ]);
    this.logger.debug('askAgent mutation exit', { method: 'askAgent', requestId, conversationId: convId });
    return { ...result, conversationId: convId };
  }

  @Query(() => AgentJobStatusResult, { name: 'agentJobStatus' })
  async agentJobStatus(@Args('jobId') jobId: string): Promise<AgentJobStatusResult> {
    return this.queue.getJobStatus(jobId);
  }

  @Query(() => [AgentConversation], { name: 'myAgentConversations' })
  async myAgentConversations(
    @Args('includeArchived', { type: () => Boolean, nullable: true }) includeArchived?: boolean,
    @Context() ctx?: GraphQLContext,
  ): Promise<AgentConversation[]> {
    const userId = ctx?.req?.user?.sub;
    if (!userId) return [];
    return this.conversationService.myConversations(userId, includeArchived ?? false);
  }

  @Query(() => [AgentConversation], { name: 'searchConversations' })
  async searchConversations(
    @Args('query', { type: () => String }) query: string,
    @Context() ctx?: GraphQLContext,
  ): Promise<AgentConversation[]> {
    const userId = ctx?.req?.user?.sub;
    if (!userId) return [];
    return this.conversationService.searchConversations(userId, query);
  }

  @Mutation(() => AgentConversation, { name: 'archiveConversation', nullable: true })
  async archiveConversation(
    @Args('id', { type: () => String }) id: string,
    @Context() ctx?: GraphQLContext,
  ): Promise<AgentConversation | null> {
    const userId = ctx?.req?.user?.sub;
    if (!userId) return null;
    return this.conversationService.archiveConversation(id);
  }

  @Mutation(() => Property, { name: 'scoreProperty', nullable: true })
  async scoreProperty(@Args('propertyId', { type: () => String }) propertyId: string): Promise<Property> {
    this.logger.debug('scoreProperty mutation entry', { method: 'scoreProperty', propertyId });
    const property = await this.tools.scoreAndPersistProperty(propertyId);
    this.logger.debug('scoreProperty mutation exit', { method: 'scoreProperty', propertyId });
    return property;
  }
}
