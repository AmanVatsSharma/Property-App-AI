/**
 * @file saved-search-alert.processor.ts
 * @module saved-search
 * @description BullMQ worker that triggers saved search alert checks.
 * @author BharatERP
 * @created 2026-03-19
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SavedSearchService } from '../services/saved-search.service';
import { LoggerService } from '@api/shared/logger';

export const SAVED_SEARCH_QUEUE = 'saved-search-alerts';

@Processor(SAVED_SEARCH_QUEUE)
export class SavedSearchAlertProcessor extends WorkerHost {
  constructor(
    private readonly savedSearchService: SavedSearchService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.debug('SavedSearchAlertProcessor: running alerts', { jobId: job.id });
    await this.savedSearchService.runAlerts();
    this.logger.debug('SavedSearchAlertProcessor: done', { jobId: job.id });
  }
}
