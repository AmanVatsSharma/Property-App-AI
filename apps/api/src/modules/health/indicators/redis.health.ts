/**
 * @file redis.health.ts
 * @module health
 * @description Redis health indicator for Terminus; used when REDIS_URL / agent queue is enabled.
 * @author BharatERP
 * @created 2025-03-12
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const url = this.config.get<string>('REDIS_URL');
    if (!url || url.trim() === '') {
      return this.getStatus(key, true, { skipped: 'REDIS_URL not set' });
    }
    const client = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
    try {
      await client.ping();
      await client.quit();
      return this.getStatus(key, true, { ping: 'pong' });
    } catch (err) {
      await client.quit().catch(() => {});
      throw new HealthCheckError('Redis check failed', this.getStatus(key, false, { error: String(err) }));
    }
  }
}
