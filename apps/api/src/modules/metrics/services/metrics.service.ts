/**
 * @file metrics.service.ts
 * @module metrics
 * @description Custom Prometheus counters and histograms for agent, OTP, property.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Injectable } from '@nestjs/common';
import { Counter, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsService {
  readonly agentCallsCounter: Counter<string>;
  readonly agentDurationHistogram: Histogram<string>;
  readonly otpSentCounter: Counter<string>;
  readonly propertyCreatedCounter: Counter<string>;

  constructor() {
    this.agentCallsCounter = new Counter({
      name: 'agent_calls_total',
      help: 'Total agent invocations',
      labelNames: ['provider', 'status'],
      registers: [register],
    });
    this.agentDurationHistogram = new Histogram({
      name: 'agent_duration_seconds',
      help: 'Agent call duration in seconds',
      labelNames: ['provider'],
      buckets: [0.5, 1, 2, 5, 10, 30],
      registers: [register],
    });
    this.otpSentCounter = new Counter({
      name: 'otp_sent_total',
      help: 'Total OTPs sent',
      labelNames: ['provider'],
      registers: [register],
    });
    this.propertyCreatedCounter = new Counter({
      name: 'property_created_total',
      help: 'Total properties created',
      registers: [register],
    });
  }

  recordAgentCall(provider: string, status: 'success' | 'error' | 'stub', durationSeconds: number): void {
    this.agentCallsCounter.inc({ provider, status }, 1);
    this.agentDurationHistogram.observe({ provider }, durationSeconds);
  }

  recordOtpSent(provider: string): void {
    this.otpSentCounter.inc({ provider }, 1);
  }

  recordPropertyCreated(): void {
    this.propertyCreatedCounter.inc(1);
  }
}
