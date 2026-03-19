/**
 * @file saved-search-alert.scheduler.ts
 * @module saved-search
 * @description Cron job that adds a job to the saved-search-alerts queue daily so runAlerts() runs for all enabled saved searches.
 * @author BharatERP
 * @created 2026-03-19
 */

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from '@api/shared/logger';
import { SAVED_SEARCH_QUEUE } from '../processors/saved-search-alert.processor';

@Injectable()
export class SavedSearchAlertScheduler {
  constructor(
    @InjectQueue(SAVED_SEARCH_QUEUE) private readonly queue: Queue,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Run saved search alert checks daily at 06:00 (server time).
   * Adds a single job to the queue; the processor runs SavedSearchService.runAlerts().
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async handleDailyAlerts(): Promise<void> {
    this.logger.debug('SavedSearchAlertScheduler: adding daily alert job');
    await this.queue.add('run-alerts', {}, { removeOnComplete: { count: 50 } });
    this.logger.debug('SavedSearchAlertScheduler: daily alert job added');
  }
}
