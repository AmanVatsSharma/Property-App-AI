/**
 * @file metrics.module.ts
 * @module metrics
 * @description Exposes GET /metrics for Prometheus; custom counters/histogram for agent, OTP, property.
 * @author BharatERP
 * @created 2026-03-17
 */

import { Module, OnModuleInit } from '@nestjs/common';
import { collectDefaultMetrics } from 'prom-client';
import { MetricsController } from './controllers/metrics.controller';
import { MetricsService } from './services/metrics.service';

@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule implements OnModuleInit {
  onModuleInit(): void {
    collectDefaultMetrics();
  }
}
