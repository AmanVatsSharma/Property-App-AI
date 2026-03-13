/**
 * @file agent.module.ts
 * @module agent
 * @description Feature module: AI agent orchestrator, tools, queue, GraphQL resolver.
 * @author BharatERP
 * @created 2025-03-11
 */

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AgentResolver } from './resolvers/agent.resolver';
import { AgentOrchestratorService } from './services/agent-orchestrator.service';
import { AgentToolsService } from './services/agent-tools.service';
import { AgentQueueService } from './services/agent-queue.service';
import { AgentProcessor } from './processors/agent.processor';
import { AgentRateLimitGuard } from '@api/common/guards/agent-rate-limit.guard';
import { PropertyModule } from '@api/modules/property/property.module';
import { AreaModule } from '@api/modules/area/area.module';

@Module({
  imports: [
    PropertyModule,
    AreaModule,
    BullModule.registerQueue({ name: AgentQueueService.AGENT_QUEUE_NAME }),
  ],
  providers: [AgentToolsService, AgentOrchestratorService, AgentQueueService, AgentProcessor, AgentRateLimitGuard, AgentResolver],
  exports: [AgentOrchestratorService, AgentQueueService],
})
export class AgentModule {}
