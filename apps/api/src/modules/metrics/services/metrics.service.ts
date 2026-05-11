/**
 * @file metrics.service.ts
 * @module metrics
 * @description Custom Prometheus counters and histograms for agent, LLM tokens, OTP, property.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Injectable } from '@nestjs/common';
import { Counter, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsService {
  readonly agentCallsCounter: Counter<string>;
  readonly agentDurationHistogram: Histogram<string>;
  readonly llmTokensCounter: Counter<string>;
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
    this.llmTokensCounter = new Counter({
      name: 'llm_tokens_total',
      help: 'LLM prompt/completion tokens by feature and provider',
      labelNames: ['feature', 'provider', 'token_type'],
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

  /**
   * Records token counts for LLM calls (Search parse, area assess, agent steps, etc.).
   */
  recordLlmTokens(feature: string, provider: string, inputTokens: number, outputTokens: number): void {
    if (inputTokens > 0) {
      this.llmTokensCounter.inc({ feature, provider, token_type: 'input' }, inputTokens);
    }
    if (outputTokens > 0) {
      this.llmTokensCounter.inc({ feature, provider, token_type: 'output' }, outputTokens);
    }
  }

  recordOtpSent(provider: string): void {
    this.otpSentCounter.inc({ provider }, 1);
  }

  recordPropertyCreated(): void {
    this.propertyCreatedCounter.inc(1);
  }

  /**
   * Returns all current metric values as label → value maps.
   * Used by AdminService to expose AI metrics to the admin dashboard.
   */
  async getMetricsSnapshot(): Promise<{
    agentCalls: Record<string, number>;
    llmTokens: Record<string, number>;
    otpSent: Record<string, number>;
    propertyCreated: number;
  }> {
    const agentMetrics = await this.agentCallsCounter.get();
    const llmMetrics = await this.llmTokensCounter.get();
    const otpMetrics = await this.otpSentCounter.get();
    const propertyMetrics = await this.propertyCreatedCounter.get();

    const agentCalls: Record<string, number> = {};
    for (const entry of agentMetrics.values) {
      const label = Object.values(entry.labels).join(':') || 'total';
      agentCalls[label] = (agentCalls[label] ?? 0) + entry.value;
    }

    const llmTokens: Record<string, number> = {};
    for (const entry of llmMetrics.values) {
      const { feature, provider, token_type } = entry.labels as Record<string, string>;
      const key = `${feature}:${provider}:${token_type}`;
      llmTokens[key] = (llmTokens[key] ?? 0) + entry.value;
    }

    const otpSent: Record<string, number> = {};
    for (const entry of otpMetrics.values) {
      const label = Object.values(entry.labels).join(':') || 'total';
      otpSent[label] = (otpSent[label] ?? 0) + entry.value;
    }

    return {
      agentCalls,
      llmTokens,
      otpSent,
      propertyCreated: propertyMetrics.values[0]?.value ?? 0,
    };
  }
}
