/**
 * @file metrics.module.ts
 * @module metrics
 * @description Exposes GET /metrics for Prometheus (default Node.js metrics).
 * @author BharatERP
 * @created 2026-03-17
 */

import { Module, OnModuleInit } from '@nestjs/common';
import { collectDefaultMetrics } from 'prom-client';
import { MetricsController } from './controllers/metrics.controller';

@Module({
  controllers: [MetricsController],
})
export class MetricsModule implements OnModuleInit {
  onModuleInit(): void {
    collectDefaultMetrics();
  }
}
