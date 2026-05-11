/**
 * File:        apps/api/src/modules/area/services/document-analysis.service.ts
 * Module:      Area · Document Analysis (AI moat tool)
 * Purpose:     Read pasted text from a property legal document (sale deed, title
 *              report, NOC, agreement-to-sell) and surface red/yellow/green
 *              risk signals plus recommended next actions. Pure LLM with a
 *              deterministic safe fallback — never blocks the agent.
 *
 * Exports:
 *   - DocumentRiskLevel                — 'green' | 'yellow' | 'red'
 *   - DocumentRiskFlag                 — single risk finding shape
 *   - DocumentAnalysisResult           — full analysis return type
 *   - DocumentAnalysisService          — Injectable with `analyze()`
 *
 * Depends on:
 *   - @api/shared/llm/create-agent-chat-model  — provider-agnostic LLM factory
 *   - @api/shared/llm/llm-token-usage          — token usage parsing
 *   - @api/modules/metrics                     — llm_tokens_total
 *
 * Side-effects:
 *   - Single LLM call when an AI provider is configured.
 *   - Prometheus counter + structured log on usage.
 *
 * Key invariants:
 *   - Output is *guidance*, not legal advice. The result.disclaimer field is
 *     always populated and surfaced verbatim in the agent message.
 *   - Truncates input to MAX_INPUT_CHARS so prompt-injection / megadocs do not
 *     blow the context window or escalate cost.
 *   - On any failure path returns a deterministic fallback flagging "review
 *     manually with a property lawyer" — never throws.
 *
 * Read order:
 *   1. DocumentAnalysisResult — output contract
 *   2. ANALYSIS_PROMPT        — the exact JSON-only prompt
 *   3. analyze()              — orchestration + parsing
 *
 * Author:       UrbanNest.ai team
 * Last-updated: 2026-05-07
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@api/shared/logger';
import { MetricsService } from '@api/modules/metrics/services/metrics.service';
import { tryCreateAgentChatModel } from '@api/shared/llm/create-agent-chat-model';
import {
  buildLlmUsageLogFields,
  parseLlmUsageFromLlmMessage,
} from '@api/shared/llm/llm-token-usage';

export type DocumentRiskLevel = 'green' | 'yellow' | 'red';

export interface DocumentRiskFlag {
  level: DocumentRiskLevel;
  /** Short, human-readable category (e.g. "Title chain", "Encumbrance"). */
  category: string;
  /** One-sentence concrete finding. */
  finding: string;
  /** What the user should do about it. */
  recommendation: string;
}

export interface DocumentAnalysisResult {
  /** Best-guess document type detected by the LLM. */
  documentType: string;
  /** Highest severity flag in the result (drives overall red/yellow/green chip). */
  overallRisk: DocumentRiskLevel;
  /** 1–2 sentence executive summary. */
  summary: string;
  flags: DocumentRiskFlag[];
  /** Items that look fine and provide reassurance. */
  positives: string[];
  /** Action items, ordered by priority. */
  recommendedActions: string[];
  disclaimer: string;
  confidence: 'low' | 'medium' | 'high';
  lastAnalyzed: string;
}

const MAX_INPUT_CHARS = 12_000;

const DISCLAIMER =
  'This is an AI-assisted preliminary review for guidance only. It is not legal advice. Engage a qualified property lawyer before signing or transferring funds.';

const ANALYSIS_PROMPT = (text: string) => `
You are a senior Indian property-law analyst reviewing a document for a buyer.

Document text (may be partial / OCR'd / summarized):
"""
${text}
"""

Identify the document type and surface risks a buyer must know BEFORE paying
or signing. Use Indian property-law context (Transfer of Property Act, RERA,
Stamp Act, Registration Act, Indian Contract Act).

Risk levels:
- "red"    = blocking. Do not proceed without legal counsel.
- "yellow" = caution. Needs clarification or amendment.
- "green"  = informational, no action.

Return a JSON object ONLY, with these exact keys:
- "documentType": string                   (e.g. "Sale Deed", "Agreement to Sell", "Title Report", "NOC", "Encumbrance Certificate", "Unknown")
- "overallRisk": string                    ("green" | "yellow" | "red")
- "summary": string                        (1-2 sentences)
- "flags": array of {                      (max 6 items, prioritise red first)
    "level": string,                       ("green" | "yellow" | "red")
    "category": string,                    (short label)
    "finding": string,                     (one sentence)
    "recommendation": string               (one sentence action)
  }
- "positives": array of strings            (max 4 items)
- "recommendedActions": array of strings   (max 5 items, action-oriented)
- "confidence": string                     ("low" | "medium" | "high")

Be concrete. Quote document phrasing when helpful. Do NOT invent clauses
that are not in the text — if unclear, mark a yellow flag asking for it.

JSON:`;

@Injectable()
export class DocumentAnalysisService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
  ) {}

  async analyze(documentText: string): Promise<DocumentAnalysisResult> {
    const truncated = (documentText ?? '').slice(0, MAX_INPUT_CHARS);
    const fallback: DocumentAnalysisResult = {
      documentType: 'Unknown',
      overallRisk: 'yellow',
      summary:
        'AI document analysis is not currently available. Please share this document with a qualified property lawyer for review.',
      flags: [
        {
          level: 'yellow',
          category: 'Manual review required',
          finding: 'AI analysis could not run (provider not configured or call failed).',
          recommendation: 'Have a property lawyer review the document end-to-end before signing or paying.',
        },
      ],
      positives: [],
      recommendedActions: [
        'Engage a property lawyer for a 30-min title review.',
        'Verify the seller’s title chain for the past 12+ years.',
        'Pull a fresh Encumbrance Certificate from the sub-registrar office.',
      ],
      disclaimer: DISCLAIMER,
      confidence: 'low',
      lastAnalyzed: new Date().toISOString(),
    };

    if (!truncated.trim()) {
      return {
        ...fallback,
        summary: 'No document text provided.',
        flags: [
          {
            level: 'yellow',
            category: 'No input',
            finding: 'Document text was empty.',
            recommendation: 'Paste the document text or upload a scanned copy.',
          },
        ],
        recommendedActions: ['Re-submit with the document text or summary.'],
      };
    }

    const created = tryCreateAgentChatModel(this.config, {
      temperature: 0.15,
      maxOutputTokens: 1024,
    });
    if (!created) {
      return fallback;
    }

    try {
      const { llm, provider } = created;
      const res = await llm.invoke(ANALYSIS_PROMPT(truncated));
      const usage = parseLlmUsageFromLlmMessage(res);
      if (usage) {
        this.metrics.recordLlmTokens(
          'document_analysis',
          provider,
          usage.inputTokens,
          usage.outputTokens,
        );
        this.logger.info('document analysis LLM usage', {
          inputChars: truncated.length,
          ...buildLlmUsageLogFields('document_analysis', provider, usage.inputTokens, usage.outputTokens),
        });
      }
      const text = typeof res.content === 'string' ? res.content : String(res.content);
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return fallback;
      const parsed = JSON.parse(match[0]) as Record<string, unknown>;

      const overall = (['green', 'yellow', 'red'] as const).includes(parsed.overallRisk as DocumentRiskLevel)
        ? (parsed.overallRisk as DocumentRiskLevel)
        : 'yellow';

      const flags: DocumentRiskFlag[] = Array.isArray(parsed.flags)
        ? (parsed.flags as Array<Record<string, unknown>>)
            .map((f) => ({
              level: (['green', 'yellow', 'red'] as const).includes(f.level as DocumentRiskLevel)
                ? (f.level as DocumentRiskLevel)
                : 'yellow',
              category: typeof f.category === 'string' ? f.category : 'Unspecified',
              finding: typeof f.finding === 'string' ? f.finding : '',
              recommendation: typeof f.recommendation === 'string' ? f.recommendation : '',
            }))
            .filter((f) => f.finding)
            .slice(0, 6)
        : [];

      const positives: string[] = Array.isArray(parsed.positives)
        ? (parsed.positives as unknown[])
            .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
            .slice(0, 4)
        : [];

      const recommendedActions: string[] = Array.isArray(parsed.recommendedActions)
        ? (parsed.recommendedActions as unknown[])
            .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
            .slice(0, 5)
        : fallback.recommendedActions;

      return {
        documentType:
          typeof parsed.documentType === 'string' && parsed.documentType.trim()
            ? parsed.documentType.trim()
            : 'Unknown',
        overallRisk: overall,
        summary:
          typeof parsed.summary === 'string' && parsed.summary.trim()
            ? parsed.summary.trim()
            : fallback.summary,
        flags: flags.length > 0 ? flags : fallback.flags,
        positives,
        recommendedActions:
          recommendedActions.length > 0 ? recommendedActions : fallback.recommendedActions,
        disclaimer: DISCLAIMER,
        confidence: (['low', 'medium', 'high'] as const).includes(parsed.confidence as 'low' | 'medium' | 'high')
          ? (parsed.confidence as 'low' | 'medium' | 'high')
          : 'low',
        lastAnalyzed: new Date().toISOString(),
      };
    } catch (err) {
      this.logger.warn('DocumentAnalysisService: LLM call failed', {
        message: err instanceof Error ? err.message : String(err),
      });
      return fallback;
    }
  }

  /** Render a single-block summary for the agent tool reply. */
  formatForAgent(result: DocumentAnalysisResult): string {
    const lines: string[] = [];
    lines.push(`Document: ${result.documentType} — overall risk: ${result.overallRisk.toUpperCase()} (confidence: ${result.confidence}).`);
    lines.push(result.summary);
    if (result.flags.length) {
      lines.push('Flags:');
      for (const f of result.flags) {
        lines.push(`- [${f.level.toUpperCase()}] ${f.category}: ${f.finding} → ${f.recommendation}`);
      }
    }
    if (result.positives.length) {
      lines.push('Looks fine: ' + result.positives.join('; ') + '.');
    }
    if (result.recommendedActions.length) {
      lines.push('Next steps: ' + result.recommendedActions.map((a, i) => `${i + 1}) ${a}`).join(' '));
    }
    lines.push(result.disclaimer);
    return lines.join('\n');
  }
}
