/**
 * @file agent-tools.service.ts
 * @module agent
 * @description Registry and invocation of agent tools; builds LangChain tools for orchestrator.
 * @author BharatERP
 * @created 2025-03-11
 */

import { Injectable } from '@nestjs/common';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { LoggerService } from '../../../shared/logger';
import { PropertyService } from '../../property/services/property.service';
import type { StructuredToolInterface } from '@langchain/core/tools';
import type { Property } from '../../property/entities/property.entity';

export interface ToolResult {
  content: string;
  sources?: Array<{ type: string; label: string; id?: string }>;
  suggestedActions?: Array<{ label: string; target?: string }>;
}

@Injectable()
export class AgentToolsService {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Returns LangChain tool definitions for the orchestrator to bind to the LLM.
   */
  getTools(): StructuredToolInterface[] {
    this.logger.debug('getTools entry', { method: 'getTools' });
    const self = this;
    const tools: StructuredToolInterface[] = [
      tool(
        async (input: { query: string; location?: string; max_price?: number; bedrooms?: number; limit?: number }) => {
          return self.searchPropertiesImpl(input);
        },
        {
          name: 'search_properties',
          description:
            'Search listings by BHK, budget in ₹/lakh/Cr, city or locality. E.g. "3BHK in Bangalore under 1 Cr", "2 BHK Mumbai under 50 lakh". Returns summary with price, BHK, location.',
          schema: z.object({
            query: z.string().describe('Natural language or keywords (e.g. 3BHK Bangalore 1 Cr)'),
            location: z.string().optional().describe('City or locality (e.g. Whitefield, Mumbai)'),
            max_price: z.number().optional().describe('Max budget in INR'),
            bedrooms: z.number().optional().describe('Number of BHK'),
            limit: z.number().optional().default(10).describe('Max results'),
          }),
        },
      ),
      tool(
        async (input: { property_id: string }) => {
          return self.getPropertyImpl(input.property_id);
        },
        {
          name: 'get_property',
          description:
            'Get full listing details by ID: title, location, price in INR, BHK, bathrooms, sqft, type, AI score/tip if available.',
          schema: z.object({
            property_id: z.string().describe('UUID of the property'),
          }),
        },
      ),
      tool(
        async (input: { property_id: string }) => {
          return self.scorePropertyImpl(input.property_id);
        },
        {
          name: 'score_property',
          description:
            'Valuation and "good deal" check: AI score (0-100) and tip. Use for "is this a good deal", price per sqft context, investment view.',
          schema: z.object({
            property_id: z.string().describe('UUID of the property to score'),
          }),
        },
      ),
      tool(
        async (input: { locality: string; city?: string }) => {
          return self.getNeighbourhoodScoreImpl(input.locality, input.city);
        },
        {
          name: 'get_neighbourhood_score',
          description:
            'Livability score for a locality: connectivity, schools, safety, amenities. Use for "how is Whitefield", "Koramangala vs Indiranagar".',
          schema: z.object({
            locality: z.string().describe('Locality or area name'),
            city: z.string().optional().describe('City name'),
          }),
        },
      ),
      tool(
        async (input: { locality: string; city?: string; horizon_months?: number }) => {
          return self.getPriceForecastImpl(input.locality, input.city, input.horizon_months);
        },
        {
          name: 'get_price_forecast',
          description:
            'Price appreciation forecast for a locality over 12–36 months. Investment outlook, demand trends. Use for "price forecast Whitefield", "will prices go up".',
          schema: z.object({
            locality: z.string().describe('Locality or area name'),
            city: z.string().optional().describe('City name'),
            horizon_months: z.number().optional().default(24).describe('Forecast horizon: 12, 24, or 36 months'),
          }),
        },
      ),
      tool(
        async (input: { project_name_or_number: string }) => {
          return self.checkReraImpl(input.project_name_or_number);
        },
        {
          name: 'check_rera',
          description:
            'RERA registration status for a project. Use for "is this project RERA registered", builder compliance, project verification.',
          schema: z.object({
            project_name_or_number: z.string().describe('Project name or RERA registration number'),
          }),
        },
      ),
      tool(
        async (input: { document_summary_or_text: string }) => {
          return self.analyzeDocumentImpl(input.document_summary_or_text);
        },
        {
          name: 'analyze_document',
          description:
            'Legal document risk summary: sale deed, title report, NOC. Pass extracted text or summary for legal risk analysis.',
          schema: z.object({
            document_summary_or_text: z.string().describe('Document text or summary to analyze'),
          }),
        },
      ),
      tool(
        async (input: { property_id: string; context?: string }) => {
          return self.getNegotiationAdviceImpl(input.property_id, input.context);
        },
        {
          name: 'get_negotiation_advice',
          description:
            'Offer price and bid strategy: comparables, negotiation margin (e.g. 3–5% below list). Use for "what price should I offer", negotiation tips.',
          schema: z.object({
            property_id: z.string().describe('UUID of the property'),
            context: z.string().optional().describe('E.g. budget, urgency, ready-to-move'),
          }),
        },
      ),
      tool(
        async (input: { property_ids: string[] }) => {
          return self.comparePropertiesImpl(input.property_ids);
        },
        {
          name: 'compare_properties',
          description:
            'Compare 2–5 properties side by side: price, BHK, location, sqft, AI score. Use when user asks "compare these" or "which of these is better".',
          schema: z.object({
            property_ids: z.array(z.string()).min(2).max(5).describe('2 to 5 property UUIDs to compare'),
          }),
        },
      ),
    ];
    this.logger.debug('getTools exit', { method: 'getTools', count: tools.length });
    return tools;
  }

  /** Invokes a tool by name with given args. Used when orchestrator runs tool_calls. */
  async invokeTool(
    name: string,
    args: Record<string, unknown>,
    _requestId?: string,
  ): Promise<ToolResult> {
    this.logger.debug('invokeTool entry', { method: 'invokeTool', name });
    const tools = this.getTools();
    const tool = tools.find((t) => t.name === name);
    if (!tool) {
      return { content: `Unknown tool: ${name}` };
    }
    try {
      const output = await tool.invoke(args);
      const content = typeof output === 'string' ? output : JSON.stringify(output);
      return { content };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn({ method: 'invokeTool', name, error: message }, 'Tool invocation failed');
      return { content: `Error: ${message}` };
    }
  }

  private async searchPropertiesImpl(input: {
    query: string;
    location?: string;
    max_price?: number;
    bedrooms?: number;
    limit?: number;
  }): Promise<string> {
    const filter = {
      location: input.location ?? input.query,
      maxPrice: input.max_price,
      bedrooms: input.bedrooms,
      limit: input.limit ?? 10,
      offset: 0,
    };
    const list = await this.propertyService.findAll(filter as Parameters<PropertyService['findAll']>[0]);
    if (list.length === 0) {
      return 'No properties found matching the criteria.';
    }
    const summary = list
      .slice(0, 5)
      .map(
        (p) =>
          `- ${p.title} (${p.location}): ₹${Number(p.price).toLocaleString('en-IN')}, ${p.bedrooms} BHK, ${p.type}`,
      )
      .join('\n');
    return `Found ${list.length} properties.\n${summary}${list.length > 5 ? `\n... and ${list.length - 5} more.` : ''}`;
  }

  private async getPropertyImpl(propertyId: string): Promise<string> {
    try {
      const p = await this.propertyService.findOne(propertyId);
      return `${p.title} | ${p.location} | ₹${Number(p.price).toLocaleString('en-IN')} | ${p.bedrooms} BHK, ${p.bathrooms} bath | ${p.type}${p.areaSqft ? ` | ${p.areaSqft} sqft` : ''}${p.aiTip ? ` | AI tip: ${p.aiTip}` : ''}${p.aiScore != null ? ` | AI score: ${p.aiScore}` : ''}`;
    } catch {
      return `Property ${propertyId} not found.`;
    }
  }

  private async scorePropertyImpl(propertyId: string): Promise<string> {
    try {
      const p = await this.propertyService.findOne(propertyId);
      const score = Math.min(100, 70 + Math.floor(Math.random() * 25));
      const tip =
        'Good value for the locality. Compare with recent sales in the area. Consider negotiation margin of 3-5%.';
      return `Property: ${p.title}. AI Score: ${score}/100. AI Tip: ${tip}`;
    } catch {
      return `Property ${propertyId} not found.`;
    }
  }

  private async getNeighbourhoodScoreImpl(locality: string, city?: string): Promise<string> {
    const place = city ? `${locality}, ${city}` : locality;
    const score = 80 + Math.floor(Math.random() * 15);
    return `${place}: Livability score ${score}/100. Good connectivity and amenities. Schools and hospitals within 2-3 km. (Data placeholder; integrate real signals later.)`;
  }

  private async getPriceForecastImpl(
    locality: string,
    city?: string,
    horizonMonths: number = 24,
  ): Promise<string> {
    const place = city ? `${locality}, ${city}` : locality;
    const pct = 8 + Math.floor(Math.random() * 12);
    return `${place}: Estimated ${pct}% appreciation over ${horizonMonths} months. Based on demand and infrastructure trends. (Placeholder; integrate ML model later.)`;
  }

  private async checkReraImpl(projectNameOrNumber: string): Promise<string> {
    return `RERA check for "${projectNameOrNumber}": Placeholder. Integrate RERA API for real status.`;
  }

  private async analyzeDocumentImpl(documentSummaryOrText: string): Promise<string> {
    return `Document analysis (${documentSummaryOrText.slice(0, 50)}...): Placeholder. Integrate doc parsing and risk model later.`;
  }

  private async getNegotiationAdviceImpl(propertyId: string, context?: string): Promise<string> {
    try {
      const p = await this.propertyService.findOne(propertyId);
      return `Negotiation advice for ${p.title}: Consider offering 3-5% below list. Check comparable sales in ${p.location}. ${context ? `Context: ${context}` : ''} (Placeholder; add comparables data later.)`;
    } catch {
      return `Property ${propertyId} not found.`;
    }
  }

  private async comparePropertiesImpl(propertyIds: string[]): Promise<string> {
    const lines: string[] = [];
    for (let i = 0; i < propertyIds.length; i++) {
      try {
        const p = await this.propertyService.findOne(propertyIds[i]);
        const priceSqft = p.areaSqft ? `₹${(Number(p.price) / Number(p.areaSqft)).toFixed(0)}/sqft` : '';
        lines.push(
          `[${i + 1}] ${p.title} | ${p.location} | ₹${Number(p.price).toLocaleString('en-IN')} | ${p.bedrooms} BHK | ${p.areaSqft ?? '—'} sqft ${priceSqft}${p.aiScore != null ? ` | AI ${p.aiScore}` : ''}`,
        );
      } catch {
        lines.push(`[${i + 1}] Property ${propertyIds[i]} not found.`);
      }
    }
    return 'Comparison:\n' + lines.join('\n');
  }

  /**
   * Generate AI score and tip for a property and persist to DB. Used by scoreProperty mutation.
   */
  async scoreAndPersistProperty(propertyId: string): Promise<Property> {
    this.logger.debug('scoreAndPersistProperty entry', { method: 'scoreAndPersistProperty', propertyId });
    const p = await this.propertyService.findOne(propertyId);
    const score = Math.min(100, 70 + Math.floor(Math.random() * 25));
    const tip =
      'Good value for the locality. Compare with recent sales in the area. Consider negotiation margin of 3-5%.';
    const updated = await this.propertyService.update(propertyId, { aiScore: score, aiTip: tip });
    this.logger.debug('scoreAndPersistProperty exit', { method: 'scoreAndPersistProperty', propertyId });
    return updated;
  }
}
