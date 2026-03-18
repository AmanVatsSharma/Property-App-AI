/**
 * @file neighbourhood-query.dto.ts
 * @module area
 * @description Query DTO for GET /api/v1/neighbourhood (locality, city).
 * @author BharatERP
 * @created 2026-03-15
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class NeighbourhoodQueryDto {
  @ApiProperty({ description: 'Locality name (e.g. Whitefield)', example: 'Whitefield' })
  @IsString()
  @MinLength(1, { message: 'locality must be at least 1 character' })
  @MaxLength(200)
  locality: string;

  @ApiPropertyOptional({ description: 'City name (e.g. Bangalore)', example: 'Bangalore' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  city?: string;
}
