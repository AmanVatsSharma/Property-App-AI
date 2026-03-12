/**
 * @file agent-queue.service.ts
 * @module agent
 * @description BullMQ queue for async askAgent; add job and poll status/result.
 * @author BharatERP
 * @created 2025-03-12
 */

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import type { AskAgentInput } from '../dtos/ask-agent-input.dto';
import type { AskAgentResult } from '../dtos/ask-agent-result.dto';

export const AGENT_QUEUE_NAME = 'agent';

export interface AgentJobData {
  input: AskAgentInput;
  requestId?: string;
  userId?: string | null;
}

export type AgentJobResult = AskAgentResult;

@Injectable()
export class AgentQueueService {
  constructor(
    @InjectQueue(AGENT_QUEUE_NAME) private readonly queue: Queue<AgentJobData, AgentJobResult>,
  ) {}

  async addJob(data: AgentJobData): Promise<string> {
    const job = await this.queue.add('ask', data, { removeOnComplete: { count: 100 } });
    return job.id ?? String(job.id);
  }

  async getJob(jobId: string): Promise<Job<AgentJobData, AgentJobResult> | undefined> {
    return this.queue.getJob(jobId);
  }

  async getJobStatus(jobId: string): Promise<{ status: string; result?: AskAgentResult }> {
    const job = await this.getJob(jobId);
    if (!job) {
      return { status: 'not_found' };
    }
    const state = await job.getState();
    const result = job.returnvalue as AskAgentResult | undefined;
    return { status: state, result };
  }
}
