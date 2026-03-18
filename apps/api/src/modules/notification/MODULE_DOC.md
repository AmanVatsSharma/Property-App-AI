# Module: notification

**Short:** In-app notifications (stub); future: push via FCM.

**Purpose:** Store notifications per user (type, title, body, optional data). Users can list their notifications (unread first), mark one read, or mark all read. Enquiry module creates a notification for the listing owner when a new enquiry is sent.

**Files:**
- `notification.module.ts` — TypeOrmModule.forFeature([Notification]); exports NotificationService.
- `entities/notification.entity.ts` — id, userId, type, title, body, data (jsonb), readAt, createdAt.
- `repository/notification.repository.ts` — create, findByUserId (unread first, then by createdAt desc), updateReadAt, markAllReadByUserId.
- `services/notification.service.ts` — create, myNotifications, markRead, markAllRead.
- `resolvers/notification.resolver.ts` — myNotifications(limit?, offset?), markNotificationRead(id), markAllNotificationsRead.

**APIs (GraphQL):**
- **Query `myNotifications(limit?, offset?)`** — List current user's notifications. Auth required.
- **Mutation `markNotificationRead(id)`** — Set readAt for the notification. Auth required; must own the notification.
- **Mutation `markAllNotificationsRead`** — Set readAt for all unread notifications of current user. Auth required.

**Integration:** EnquiryService.send() calls NotificationService.create() for the listing owner when an enquiry is created (type 'enquiry', title 'New enquiry', body truncated message, data: { enquiryId, propertyId }).

**Change-log:**
- 2026-03-18: Initial module (migration CreateNotification, entity, repository, service, resolver). Enquiry integration.
