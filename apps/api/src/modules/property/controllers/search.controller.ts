/**
 * @file search.controller.ts
 * @module property
 * @description REST controller for natural-language property search; POST /api/v1/search.
 * @author BharatERP
 * @created 2026-03-17
 */

import { Controller, Post, Body } from '@nestjs/common';
import { Public } from '@api/common/decorators/public.decorator';
import { PropertyService } from '../services/property.service';
import { SearchParserService } from '@api/modules/search/services/search-parser.service';
import type { Property } from '../entities/property.entity';

export interface SearchRequestBody {
  query: string;
}

@Controller('api/v1')
export class SearchController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly searchParser: SearchParserService,
  ) {}

  /**
   * POST /api/v1/search
   * Body: { query: "3 BHK near school near metro in Bangalore under 1 Cr" }
   * Returns array of properties matching the parsed filters.
   */
  @Public()
  @Post('search')
  async search(@Body() body: SearchRequestBody): Promise<Property[]> {
    const query = typeof body?.query === 'string' ? body.query.trim() : '';
    const parsed = await this.searchParser.parse(query || '');
    const filter = {
      ...(parsed.location && { location: parsed.location }),
      ...(parsed.bedrooms != null && { bedrooms: parsed.bedrooms }),
      ...(parsed.minPrice != null && { minPrice: parsed.minPrice }),
      ...(parsed.maxPrice != null && { maxPrice: parsed.maxPrice }),
      ...(parsed.type && { type: parsed.type }),
      ...(parsed.schoolsScoreMin != null && { schoolsScoreMin: parsed.schoolsScoreMin }),
      ...(parsed.connectivityScoreMin != null && { connectivityScoreMin: parsed.connectivityScoreMin }),
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
      limit: 20,
      offset: 0,
    };
    return this.propertyService.findAll(filter);
  }
}
