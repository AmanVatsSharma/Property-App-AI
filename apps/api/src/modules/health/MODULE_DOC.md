# Module: health

**Short:** Health checks for load balancers and ops (DB and optional Redis).

**Purpose:** Expose a Terminus-based health endpoint that pings the database and, when configured, Redis. Unauthenticated and lightweight; suitable for load balancer and deploy probes.

**Files:**
- health.module.ts — Nest module (Terminus, controller, Redis indicator)
- controllers/health.controller.ts — GET /health (Terminus checks)
- indicators/redis.health.ts — Redis health indicator (skipped when REDIS_URL not set)
- index.ts — re-exports
- MODULE_DOC.md — this file

**Dependencies:**
- `@nestjs/terminus` — health check framework and TypeORM/DB ping
- TypeORM — database connectivity (ping check)
- `ioredis` (via RedisHealthIndicator) — Redis ping when REDIS_URL is set

**APIs (REST):**
- `GET /health` — returns `{ status, info: { database: { status }, redis: { status } } }`. Database is always checked; Redis is checked only when REDIS_URL is set (otherwise redis is reported with `skipped: 'REDIS_URL not set'`). Route is public (`@Public()`).

**Env vars:** Health does not define its own env; it uses app-level config. Database connectivity is from the app’s TypeORM config. Optional: `REDIS_URL` — when set, the Redis health indicator runs; when unset or empty, the Redis check is skipped and not considered failing.

**Change-log:**
- 2026-03-15: MVP readiness: no mock data; deploy and env checklist in docs/DEPLOYMENT.md.
- 2025-03-10: Added health module with Terminus and TypeORM DB check.
- 2025-03-12: Added Redis health indicator (optional when REDIS_URL set).
- 2026-03-14: Documentation consistency pass (canonical template and code alignment).
