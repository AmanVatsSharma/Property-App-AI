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
import { LoggerService } from '@api/shared/logger';
import { PropertyService } from '@api/modules/property/services/property.service';
import { AreaService } from '@api/modules/area/services/area.service';
import type { Area } from '@api/modules/area/entities/area.entity';
import type { StructuredToolInterface } from '@langchain/core/tools';
import type { Property } from '@api/modules/property/entities/property.entity';

export interface ToolResult {
  content: string;
  sources?: Array<{ type: string; label: string; id?: string }>;
  suggestedActions?: Array<{ label: string; target?: string }>;
}

export interface AgentContext {
  userId?: string | null;
}

@Injectable()
export class AgentToolsService {
  private agentContext: AgentContext = {};

  constructor(
    private readonly propertyService: PropertyService,
    private readonly areaService: AreaService,
    private readonly logger: LoggerService,
  ) {}

  setAgentContext(ctx: AgentContext): void {
    this.agentContext = ctx ?? {};
  }

  clearAgentContext(): void {
    this.agentContext = {};
  }

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
        async (input: { locality: string; city?: string }) => {
          return self.assessRegionImpl(input.locality, input.city);
        },
        {
          name: 'assess_region',
          description:
            'Load or assess a locality/region and return a short summary (livability, connectivity, schools, safety, price trend). Use before scoring a property in that area, or when user asks "how is X area".',
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
      tool(
        async (input: {
          title: string;
          location: string;
          price: number;
          type?: string;
          listing_for?: string;
          bedrooms?: number;
          bathrooms?: number;
        }) => {
          return self.createListingImpl(input);
        },
        {
          name: 'create_listing',
          description:
            'Create a new property listing for the signed-in user (rent or sell). Use when the user wants to "post", "list", "rent out", or "sell" a property. Requires: title, location, price. Optional: type (apartment, villa, etc.), listing_for (sell or rent), bedrooms, bathrooms. User must be signed in.',
          schema: z.object({
            title: z.string().describe('Short listing title e.g. 2BHK Apartment in Koramangala'),
            location: z.string().describe('Address, locality, or city'),
            price: z.number().describe('Price in INR'),
            type: z.string().optional().default('apartment').describe('apartment, villa, plot, builder-floor, office'),
            listing_for: z.string().optional().default('sell').describe('sell or rent'),
            bedrooms: z.number().optional().default(0),
            bathrooms: z.number().optional().default(0),
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
      if (typeof output === 'object' && output != null && 'content' in output) {
        return output as ToolResult;
      }
      const content = typeof output === 'string' ? output : JSON.stringify(output);
      return { content };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn({ method: 'invokeTool', name, error: message }, 'Tool invocation failed');
      return { content: `Error: ${message}` };
    }
  }

  private async createListingImpl(input: {
    title: string;
    location: string;
    price: number;
    type?: string;
    listing_for?: string;
    bedrooms?: number;
    bathrooms?: number;
  }): Promise<ToolResult> {
    const userId = this.agentContext.userId;
    if (!userId) {
      return {
        content: 'You need to sign in to post a listing. Please sign in and try again.',
      };
    }
    try {
      const property = await this.propertyService.create(
        {
          title: input.title,
          location: input.location,
          price: input.price,
          type: input.type ?? 'apartment',
          listingFor: input.listing_for ?? 'sell',
          bedrooms: input.bedrooms ?? 0,
          bathrooms: input.bathrooms ?? 0,
        },
        userId,
      );
      return {
        content: `Listing created: "${property.title}" in ${property.location} at ₹${Number(property.price).toLocaleString('en-IN')}.`,
        suggestedActions: [{ label: 'View listing', target: `/property/${property.id}` }],
        sources: [{ type: 'property', label: property.title, id: property.id }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn({ method: 'createListingImpl', error: message }, 'Create listing failed');
      return { content: `Could not create listing: ${message}` };
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
      const { locality, city } = this.parseLocationToLocalityCity(p.location);
      const area = await this.areaService.getOrCreate(locality, city, { assessIfMissing: true });
      const { score, tip } = this.computePropertyScoreAndTip(p, area);
      await this.propertyService.update(propertyId, { aiScore: score, aiTip: tip });
      return `Property: ${p.title}. AI Score: ${score}/100. AI Tip: ${tip}`;
    } catch {
      return `Property ${propertyId} not found.`;
    }
  }

  private async getNeighbourhoodScoreImpl(locality: string, city?: string): Promise<string> {
    const area = await this.areaService.getOrCreate(locality, city ?? '', { assessIfMissing: true });
    return this.formatAreaSummary(area);
  }

  private async assessRegionImpl(locality: string, city?: string): Promise<string> {
    const area = await this.areaService.getOrCreate(locality, city ?? '', { assessIfMissing: true });
    return this.formatAreaSummary(area);
  }

  private formatAreaSummary(area: Area): string {
    const place = area.city ? `${area.locality}, ${area.city}` : area.locality;
    const liv = area.livabilityScore ?? '—';
    const conn = area.connectivityScore ?? '—';
    const schools = area.schoolsScore ?? '—';
    const safety = area.safetyScore ?? '—';
    const trend = area.priceTrendPctAnnual != null ? `${area.priceTrendPctAnnual}%` : '—';
    const summary = area.amenitiesSummary ?? 'Data assessed for this locality.';
    return `${place}: Livability ${liv}/100, Connectivity ${conn}/100, Schools ${schools}/100, Safety ${safety}/100. Price trend (est. annual): ${trend}. ${summary}`;
  }

  /** Parse property.location string into locality and city (e.g. "Koramangala, Bangalore" -> locality, city). */
  private parseLocationToLocalityCity(location: string): { locality: string; city: string } {
    const parts = (location ?? '').trim().split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return { locality: parts[0] ?? 'Unknown', city: parts.slice(1).join(', ') };
    }
    return { locality: parts[0] || 'Unknown', city: '' };
  }

  private computePropertyScoreAndTip(property: Property, area: Area): { score: number; tip: string } {
    const liv = area.livabilityScore ?? 75;
    const trend = area.priceTrendPctAnnual ?? 8;
    const priceSqft = property.areaSqft
      ? Number(property.price) / Number(property.areaSqft)
      : null;
    let score = Math.min(100, Math.max(0, liv + Math.floor((trend - 5) / 2)));
    if (priceSqft != null && priceSqft > 0) {
      if (priceSqft < 10000) score = Math.min(100, score + 5);
      else if (priceSqft > 25000) score = Math.max(0, score - 5);
    }
    const tip =
      area.amenitiesSummary?.slice(0, 120) ||
      'Good value for the locality. Compare with recent sales. Consider negotiation margin of 3-5%.';
    return { score, tip };
  }

  private async getPriceForecastImpl(
    _locality: string,
    _city?: string,
    _horizonMonths: number = 24,
  ): Promise<string> {
    return 'Price forecast for localities is coming soon. This feature will use demand and infrastructure data in a future update.';
  }

  private async checkReraImpl(_projectNameOrNumber: string): Promise<string> {
    return 'RERA verification is coming soon. Real-time RERA API integration will be available in a future update.';
  }

  private async analyzeDocumentImpl(_documentSummaryOrText: string): Promise<string> {
    return 'Document and legal risk analysis is coming soon. This feature will be available in a future update.';
  }

  private async getNegotiationAdviceImpl(propertyId: string, context?: string): Promise<string> {
    try {
      const p = await this.propertyService.findOne(propertyId);
      return `Negotiation advice for "${p.title}" (${p.location}): Coming soon. Comparables and bid strategy will be available in a future update.${context ? ` You mentioned: ${context}.` : ''}`;
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
    const { locality, city } = this.parseLocationToLocalityCity(p.location);
    const area = await this.areaService.getOrCreate(locality, city, { assessIfMissing: true });
    const { score, tip } = this.computePropertyScoreAndTip(p, area);
    const updated = await this.propertyService.update(propertyId, { aiScore: score, aiTip: tip });
    this.logger.debug('scoreAndPersistProperty exit', { method: 'scoreAndPersistProperty', propertyId });
    return updated;
  }
}
