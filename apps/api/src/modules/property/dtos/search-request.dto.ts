/**
 * @file search-request.dto.ts
 * @module property
 * @description REST body DTO for POST /api/v1/search (natural-language query).
 * @author BharatERP
 * @created 2026-03-18
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SearchRequestBody {
  @ApiProperty({ description: 'Natural language search query (e.g. "3 BHK near school in Bangalore under 1 Cr")' })
  @IsString()
  query: string;
}
