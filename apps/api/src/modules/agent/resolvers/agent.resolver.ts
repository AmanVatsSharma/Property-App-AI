/**
 * @file agent.resolver.ts
 * @module agent
 * @description GraphQL resolver: askAgent, optional scoreProperty.
 * @author BharatERP
 * @created 2025-03-11
 */

import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { AgentOrchestratorService } from '../services/agent-orchestrator.service';
import { AgentToolsService } from '../services/agent-tools.service';
import { AskAgentInput } from '../dtos/ask-agent-input.dto';
import { AskAgentResult } from '../dtos/ask-agent-result.dto';
import { LoggerService } from '../../../shared/logger';
import { Property } from '../../property/entities/property.entity';

interface GraphQLContext {
  requestId?: string;
}

@Resolver()
export class AgentResolver {
  constructor(
    private readonly orchestrator: AgentOrchestratorService,
    private readonly tools: AgentToolsService,
    private readonly logger: LoggerService,
  ) {}

  @Mutation(() => AskAgentResult, { name: 'askAgent' })
  async askAgent(
    @Args('input') input: AskAgentInput,
    @Context() ctx?: GraphQLContext,
  ): Promise<AskAgentResult> {
    const requestId = ctx?.requestId;
    this.logger.debug('askAgent mutation entry', { method: 'askAgent', requestId });
    const result = await this.orchestrator.ask(input, requestId);
    this.logger.debug('askAgent mutation exit', { method: 'askAgent', requestId });
    return result;
  }

  @Mutation(() => Property, { name: 'scoreProperty', nullable: true })
  async scoreProperty(@Args('propertyId') propertyId: string): Promise<Property> {
    this.logger.debug('scoreProperty mutation entry', { method: 'scoreProperty', propertyId });
    const property = await this.tools.scoreAndPersistProperty(propertyId);
    this.logger.debug('scoreProperty mutation exit', { method: 'scoreProperty', propertyId });
    return property;
  }
}
