/**
 * @file health.module.ts
 * @module health
 * @description Health check feature module (Terminus, TypeORM, Redis).
 * @author BharatERP
 * @created 2025-03-10
 */

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controllers/health.controller';
import { RedisHealthIndicator } from './indicators/redis.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [RedisHealthIndicator],
})
export class HealthModule {}
