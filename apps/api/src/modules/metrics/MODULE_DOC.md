# Metrics Module

## Purpose

Exposes a Prometheus-compatible `/metrics` endpoint for runtime observability. Used by Prometheus scrapers, Grafana dashboards, and Kubernetes liveness probes. **This endpoint is public** — restrict access at the network/ingress layer in production.

## Files

| File | Role |
|------|------|
| `metrics.module.ts` | NestJS module; imports `MetricsService` and `MetricsController`. |
| `services/metrics.service.ts` | Wraps `prom-client`; exposes `collectDefaultMetrics()` and `register`. |
| `controllers/metrics.controller.ts` | `GET /metrics` — returns Prometheus text format. Decorated `@Public()`. |

## Flows

```
Prometheus Scraper
  └─ GET /metrics
       └─ MetricsController.getMetrics()
            └─ MetricsService.getMetrics()   ← prom-client register
                  └─ Returns text/plain metrics
```

## APIs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/metrics` | Public | Prometheus scrape endpoint |

## Security Notes

- This endpoint is `@Public()` (no JWT required).
- In production, restrict at the ingress / network level (e.g. only allow scraping from within the cluster, or behind a VPN/IP allowlist).
- Default metrics include: event loop lag, heap usage, GC stats, HTTP request durations.

## Scaling

- `prom-client` default metrics are per-process. For multi-pod deployments, use a Prometheus federation setup or push-gateway to aggregate across replicas.
- No Redis or DB dependency; safe to run in any environment.

## Changelog

| Date | Change |
|------|--------|
| 2026-03-26 | Added MODULE_DOC.md (was missing). No code changes. |
