/**
 * @file health.controller.ts
 * @module health
 * @description REST health checks: liveness (process up), readiness (DB + Redis).
 * @author BharatERP
 * @created 2025-03-10
 */

import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '@api/common/decorators/public.decorator';
import { RedisHealthIndicator } from '../indicators/redis.health';

@Controller('health')
@Public()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly redis: RedisHealthIndicator,
  ) {}

  /** Liveness: process is up. No DB/Redis checks. Use for Kubernetes livenessProbe. */
  @Get('live')
  live() {
    return { status: 'ok' };
  }

  /** Readiness: DB and optional Redis. Use for Kubernetes readinessProbe. */
  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.isHealthy('redis'),
    ]);
  }

  /** Legacy combined check (same as readiness). */
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.isHealthy('redis'),
    ]);
  }
}
