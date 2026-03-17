/**
 * @file metrics.controller.ts
 * @module metrics
 * @description Prometheus metrics endpoint (GET /metrics) for observability.
 * @author BharatERP
 * @created 2026-03-17
 */

import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '@api/common/decorators/public.decorator';
import { register } from 'prom-client';

@Controller('metrics')
@Public()
export class MetricsController {
  @Get()
  @Header('Content-Type', register.contentType)
  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}
