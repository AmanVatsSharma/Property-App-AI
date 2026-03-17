# Runbook — Property-App-AI API

Short operational guide: health, logs, DB, migrations, and common issues.

## Health checks

- **Liveness:** `GET /health/live` — process is up; no DB/Redis. Use for Kubernetes `livenessProbe`.
- **Readiness:** `GET /health/ready` — DB and Redis (if used). Use for Kubernetes `readinessProbe`.
- **Legacy:** `GET /health` — same as readiness (DB + Redis).

If readiness fails, the app cannot serve traffic (DB or Redis down). Check DB connectivity and Redis URL (`REDIS_URL`) when using rate limiting or agent queue.

## Logs

- **Format:** Production logs are JSON (Pino). Development may use pretty-print.
- **Fields:** `requestId`, `durationMs`, `context` are set per request where applicable. Do not log secrets or PII.
- **Where:** Logs go to stdout. Configure your platform for retention and search (e.g. CloudWatch, Datadog, ELK).

## Database

- **Migrations:** Run before deploy: `nx run api:migration:run` (from repo root; requires `DB_*` env).
- **Backups:** Use a recommended PostgreSQL backup strategy (e.g. daily backups, PITR). Test restore periodically.
- **Pool:** Tune `DB_POOL_MAX` and `DB_POOL_IDLE_TIMEOUT_MS` if you see connection exhaustion or idle timeouts.

## High error rate or timeouts

- Check **health** and **metrics** (`GET /metrics`): CPU/memory and default Node metrics.
- Check **request timeout:** `REQUEST_TIMEOUT_MS` (default 30s). Increase only if justified.
- **Rate limiting:** If Redis is used, global throttling and agent rate limit are Redis-backed. If Redis is down, throttling falls back to in-memory (per instance). Check `REDIS_URL` and Redis health.
- **External calls:** Geocoding, Mapbox nearby, and LLM calls use retries (2 retries, exponential backoff) on 5xx/network errors. Repeated failures will still surface; check Mapbox/OpenAI/Anthropic status and keys.

## Rate-limit issues

- **Global throttle:** `THROTTLE_TTL`, `THROTTLE_LIMIT` (per IP). With Redis, limits are shared across instances.
- **Agent rate limit:** `AGENT_RATE_LIMIT_PER_MIN` per IP for agent mutations. Same Redis-backed store when `REDIS_URL` is set.
- If users hit limits often, consider increasing limits or scaling; ensure Redis is healthy when using multi-instance.

## Graceful shutdown

The API uses `enableShutdownHooks()`. On SIGTERM, NestJS runs shutdown hooks (e.g. close DB, Redis throttle client). Ensure orchestrator gives a drain period so in-flight requests complete.

## Escalation

- **API/DB owner:** See project ownership.
- **Secrets:** Never commit; use env or secret store. Rotate `JWT_SECRET` and DB credentials per policy.
- **Incidents:** Check logs (requestId), metrics, and health; then DB/Redis and external providers.
