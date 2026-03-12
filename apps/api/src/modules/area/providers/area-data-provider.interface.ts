/**
 * @file area-data-provider.interface.ts
 * @module area
 * @description Interface for external area/locality data; pluggable via AREA_PROVIDER.
 * @author BharatERP
 * @created 2025-03-13
 */

export interface AreaData {
  livabilityScore?: number | null;
  priceTrendPctAnnual?: number | null;
  connectivityScore?: number | null;
  schoolsScore?: number | null;
  safetyScore?: number | null;
  amenitiesSummary?: string | null;
}

/**
 * Optional external provider for area assessment. When configured (e.g. AREA_PROVIDER=mapbox),
 * AreaAssessorService can call getAreaData before falling back to LLM.
 */
export interface AreaDataProvider {
  getAreaData(locality: string, city?: string): Promise<AreaData | null>;
}
