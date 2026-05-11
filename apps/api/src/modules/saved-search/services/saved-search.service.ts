/**
 * @file saved-search.service.ts
 * @module saved-search
 * @description CRUD for saved searches; alert dispatch via BullMQ.
 * @author BharatERP
 * @created 2026-03-19
 */

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SavedSearch } from '../entities/saved-search.entity';
import { SavedSearchRepository } from '../repository/saved-search.repository';
import { NotificationService } from '@api/modules/notification/services/notification.service';
import { PropertyService } from '@api/modules/property/services/property.service';
import { UserService } from '@api/modules/user/services/user.service';
import { MailService } from '@api/modules/mail/mail.service';
import { savedSearchAlertHtml, savedSearchAlertText } from '@api/modules/mail/templates/saved-search-alert.template';
import { CreateSavedSearchInput, UpdateSavedSearchInput } from '../dtos/saved-search.dto';
import { LoggerService } from '@api/shared/logger';
import { PropertyFilterDto } from '@api/modules/property/dtos/property-filter.dto';

const ALERT_COOLDOWN_HOURS = 24;
const ALERT_RESULT_LIMIT = 5;

@Injectable()
export class SavedSearchService {
  constructor(
    private readonly repo: SavedSearchRepository,
    private readonly notificationService: NotificationService,
    private readonly propertyService: PropertyService,
    private readonly userService: UserService,
    private readonly logger: LoggerService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async findByUser(userId: string): Promise<SavedSearch[]> {
    return this.repo.findByUserId(userId);
  }

  async create(userId: string, input: CreateSavedSearchInput): Promise<SavedSearch> {
    return this.repo.create(userId, {
      name: input.name,
      filters: input.filters,
      alertEnabled: input.alertEnabled ?? true,
      lastAlertSentAt: null,
    });
  }

  async update(id: string, userId: string, input: UpdateSavedSearchInput): Promise<SavedSearch> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Saved search not found');
    if (existing.userId !== userId) throw new ForbiddenException('Not your saved search');
    const updated = await this.repo.update(id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.filters !== undefined && { filters: input.filters }),
      ...(input.alertEnabled !== undefined && { alertEnabled: input.alertEnabled }),
    });
    return updated!;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Saved search not found');
    if (existing.userId !== userId) throw new ForbiddenException('Not your saved search');
    return this.repo.delete(id);
  }

  /**
   * Run alert check for all saved searches with alertEnabled = true.
   * Called by BullMQ processor on schedule.
   */
  async runAlerts(): Promise<void> {
    const searches = await this.repo.findAllWithAlerts();
    this.logger.debug('runAlerts', { count: searches.length });

    for (const search of searches) {
      try {
        const hoursSinceLast = search.lastAlertSentAt
          ? (Date.now() - search.lastAlertSentAt.getTime()) / 3_600_000
          : Infinity;

        if (hoursSinceLast < ALERT_COOLDOWN_HOURS) continue;

        const filters = search.filters as Record<string, unknown>;
        const filterDto: PropertyFilterDto = {
          location: filters.location as string | undefined,
          bedrooms: filters.bedrooms as number | undefined,
          minPrice: filters.minPrice as number | undefined,
          maxPrice: filters.maxPrice as number | undefined,
          type: filters.type as string | undefined,
          limit: ALERT_RESULT_LIMIT,
          offset: 0,
        };

        const results = await this.propertyService.findAll(filterDto);

        if (results.length === 0) continue;

        const body = `${results.length} new propert${results.length === 1 ? 'y' : 'ies'} match "${search.name}"`;
        await this.notificationService.create(
          search.userId,
          'saved_search_alert',
          'New matches found',
          body,
          { savedSearchId: search.id, count: results.length },
        );

        const siteUrl = this.config.get<string>('NEXT_PUBLIC_SITE_URL') ?? 'https://urbannest.ai';
        const searchUrl = `${siteUrl}/search?savedSearch=${search.id}`;

        const user = await this.userService.findById(search.userId);
        const userEmail = user?.email;

        if (userEmail && userEmail.includes('@')) {
          this.mail
            .send({
              to: userEmail,
              subject: `${results.length} new matches for "${search.name}"`,
              html: savedSearchAlertHtml({
                name: search.name,
                locality: typeof filters.location === 'string' ? filters.location : undefined,
                count: results.length,
                searchUrl,
              }),
              text: savedSearchAlertText({ name: search.name, count: results.length, searchUrl }),
            })
            .catch(() => {});
        } else {
          this.logger.debug('alert email skipped — user has no email address', {
            savedSearchId: search.id,
            userId: search.userId,
          });
        }

        await this.repo.markAlertSent(search.id);
        this.logger.debug('alert sent', {
          savedSearchId: search.id,
          userId: search.userId,
          count: results.length,
        });
      } catch (err) {
        this.logger.warn('alert failed', {
          savedSearchId: search.id,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }
}
