# Module: health

**Short:** Health checks for load balancers and ops.

**Purpose:** Expose Terminus-based health endpoint (DB ping). Unauthenticated, lightweight.

**Files:**
- health.module.ts — Nest module
- controllers/health.controller.ts — GET /health
- MODULE_DOC.md — this file

**APIs (REST):**
- `GET /health` — returns { status, info: { database: { status } } }

**Change-log:**
- 2025-03-10: Added health module with Terminus and TypeORM DB check.
