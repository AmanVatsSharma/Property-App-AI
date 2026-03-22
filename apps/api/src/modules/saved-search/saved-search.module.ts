/**
 * @file saved-search.module.ts
 * @module saved-search
 * @description Feature module: saved property searches with optional email/alert support.
 * @author BharatERP
 * @created 2026-03-19
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { SavedSearch } from './entities/saved-search.entity';
import { SavedSearchRepository } from './repository/saved-search.repository';
import { SavedSearchService } from './services/saved-search.service';
import { SavedSearchResolver } from './resolvers/saved-search.resolver';
import { SavedSearchAlertProcessor, SAVED_SEARCH_QUEUE } from './processors/saved-search-alert.processor';
import { SavedSearchAlertScheduler } from './schedulers/saved-search-alert.scheduler';
import { NotificationModule } from '@api/modules/notification/notification.module';
import { PropertyModule } from '@api/modules/property/property.module';
import { LoggerModule } from '@api/shared/logger';

@Module({
  imports: [
    TypeOrmModule.forFeature([SavedSearch]),
    BullModule.registerQueue({ name: SAVED_SEARCH_QUEUE }),
    LoggerModule,
    NotificationModule,
    PropertyModule,
  ],
  providers: [
    SavedSearchRepository,
    SavedSearchService,
    SavedSearchResolver,
    SavedSearchAlertProcessor,
    SavedSearchAlertScheduler,
  ],
  exports: [SavedSearchService],
})
export class SavedSearchModule {}
