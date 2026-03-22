# Module: notification

**Short:** In-app notifications (stub); real-time push via WebSocket; future: FCM.

**Purpose:** Store notifications per user (type, title, body, optional data). Users can list their notifications (unread first), mark one read, or mark all read. Enquiry module creates a notification for the listing owner when a new enquiry is sent. When a notification is created, NotificationService pushes it in real time to the user's WebSocket room (namespace `/notifications`) via NotificationGateway so clients can show toasts or update the bell without polling.

**Files:**
- `notification.module.ts` — TypeOrmModule; providers: NotificationGateway (JWT verification uses **global** `JwtModule` from `AppModule`).
- `entities/notification.entity.ts` — id, userId, type, title, body, data (jsonb), readAt, createdAt.
- `gateways/notification.gateway.ts` — WebSocket namespace `/notifications`; on connection verifies JWT (handshake.auth.token or Authorization), joins room `user:${userId}`; pushToUser(userId, event, data); ping/pong.
- `repository/notification.repository.ts` — create, findByUserId (unread first, then by createdAt desc), updateReadAt, markAllReadByUserId.
- `services/notification.service.ts` — create (then gateway?.pushToUser('notification', ...)), myNotifications, markRead, markAllRead. Gateway injected @Optional() for tests.
- `resolvers/notification.resolver.ts` — myNotifications(limit?, offset?), markNotificationRead(id), markAllNotificationsRead.

**APIs (GraphQL):**
- **Query `myNotifications(limit?, offset?)`** — List current user's notifications. Auth required.
- **Mutation `markNotificationRead(id)`** — Set readAt for the notification. Auth required; must own the notification.
- **Mutation `markAllNotificationsRead`** — Set readAt for all unread notifications of current user. Auth required.

**WebSocket:** Clients connect to `{API_URL}/notifications` with auth token; server emits `notification` with { id, type, title, body, data, createdAt } when NotificationService.create() is called. main.ts uses IoAdapter (@nestjs/platform-socket.io) for Socket.IO.

**Integration:** EnquiryService.send() calls NotificationService.create() for the listing owner when an enquiry is created (type 'enquiry', title 'New enquiry', body truncated message, data: { enquiryId, propertyId }). SavedSearchService.runAlerts() creates notifications (type 'saved_search_alert').

**Change-log:**
- 2026-03-21: `notification.data` (jsonb) exposed in GraphQL with `GraphQLJSON` from `graphql-type-json`; removed unused `JsonScalar` provider from the module (single `JSON` scalar in schema).
- 2026-03-20: JwtModule registered as `global: true` in AppModule so NotificationGateway can inject JwtService (MODULE_DOC previously described JwtModule here; implementation now matches).
- 2026-03-19: NotificationGateway (namespace /notifications, JWT auth, pushToUser); NotificationService.create() pushes real-time event; main.ts IoAdapter; JwtModule in NotificationModule for gateway.
- 2026-03-18: Initial module (migration CreateNotification, entity, repository, service, resolver). Enquiry integration.
