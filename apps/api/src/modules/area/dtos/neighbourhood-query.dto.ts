/**
 * @file neighbourhood-query.dto.ts
 * @module area
 * @description Query DTO for GET /api/v1/neighbourhood (locality, city).
 * @author BharatERP
 * @created 2026-03-15
 */

import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class NeighbourhoodQueryDto {
  @IsString()
  @MinLength(1, { message: 'locality must be at least 1 character' })
  @MaxLength(200)
  locality: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  city?: string;
}
