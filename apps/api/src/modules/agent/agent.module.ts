/**
 * @file agent.module.ts
 * @module agent
 * @description Feature module: AI agent orchestrator, tools, GraphQL resolver.
 * @author BharatERP
 * @created 2025-03-11
 */

import { Module } from '@nestjs/common';
import { AgentResolver } from './resolvers/agent.resolver';
import { AgentOrchestratorService } from './services/agent-orchestrator.service';
import { AgentToolsService } from './services/agent-tools.service';
import { PropertyModule } from '../property/property.module';

@Module({
  imports: [PropertyModule],
  providers: [AgentToolsService, AgentOrchestratorService, AgentResolver],
  exports: [AgentOrchestratorService],
})
export class AgentModule {}
