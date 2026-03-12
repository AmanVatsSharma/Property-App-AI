/**
 * @file agent.processor.ts
 * @module agent
 * @description BullMQ worker: runs orchestrator.ask() for queued agent jobs.
 * @author BharatERP
 * @created 2025-03-12
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AgentQueueService, type AgentJobData, type AgentJobResult } from '../services/agent-queue.service';
import { AgentOrchestratorService } from '../services/agent-orchestrator.service';
import { LoggerService } from '../../../shared/logger';

@Processor(AgentQueueService.AGENT_QUEUE_NAME)
export class AgentProcessor extends WorkerHost {
  constructor(
    private readonly orchestrator: AgentOrchestratorService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job<AgentJobData, AgentJobResult>): Promise<AgentJobResult> {
    const { input, requestId } = job.data;
    this.logger.debug('Agent job started', { jobId: job.id, requestId });
    const result = await this.orchestrator.ask(input, requestId);
    this.logger.debug('Agent job completed', { jobId: job.id, requestId });
    return result;
  }
}
