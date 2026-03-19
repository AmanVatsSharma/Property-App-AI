# Module: saved-search

**Short:** User saved property searches with optional email/alert support via BullMQ.

**Purpose:** Users can save a search (name + filters matching PropertyFilterDto shape) and optionally enable alerts. When alerts are enabled, a scheduled job (BullMQ processor) runs `runAlerts()`: for each saved search with `alertEnabled` and not alerted in the last 24h, it runs a property search with the saved filters, and if new results exist, creates a notification (type `saved_search_alert`) and marks the search as alerted. Alerts are triggered by adding a job to the `saved-search-alerts` queue (e.g. via cron or @nestjs/schedule).

**Files:**
- `saved-search.module.ts` — TypeOrmModule, BullModule (SAVED_SEARCH_QUEUE), NotificationModule, PropertyModule; exports SavedSearchService.
- `entities/saved-search.entity.ts` — id, userId, name, filters (jsonb), alertEnabled, lastAlertSentAt, createdAt, updatedAt.
- `dtos/saved-search.dto.ts` — CreateSavedSearchInput, UpdateSavedSearchInput (GraphQL InputTypes, class-validator).
- `repository/saved-search.repository.ts` — findByUserId, findById, findAllWithAlerts, create, update, delete, markAlertSent.
- `services/saved-search.service.ts` — CRUD; runAlerts() (loads alert-enabled searches, 24h cooldown, propertyService.findAll + notification create + markAlertSent).
- `resolvers/saved-search.resolver.ts` — mySavedSearches, createSavedSearch, updateSavedSearch, deleteSavedSearch (all auth-required).
- `processors/saved-search-alert.processor.ts` — BullMQ @Processor(SAVED_SEARCH_QUEUE); process(job) calls savedSearchService.runAlerts().

**APIs (GraphQL):**
- **Query `mySavedSearches`** — List current user's saved searches. Auth required.
- **Mutation `createSavedSearch(input)`** — Create a saved search (name, filters, alertEnabled?). Auth required.
- **Mutation `updateSavedSearch(id, input)`** — Update name, filters, or alertEnabled. Auth required; must own the search.
- **Mutation `deleteSavedSearch(id)`** — Delete a saved search. Auth required; must own the search.

**Scheduling:** The processor runs when a job is added to the queue. A cron or external scheduler should add a job to `saved-search-alerts` periodically (e.g. daily) to trigger alert checks. No in-repo scheduler by default.

**Change-log:**
- 2026-03-19: Initial module (migration CreateSavedSearch, entity, DTOs, repository, service, resolver, BullMQ processor). Alert cooldown 24h; runAlerts uses PropertyService.findAll and NotificationService.create.
