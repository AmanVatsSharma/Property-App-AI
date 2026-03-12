/**
 * @file area-assess.prompt.ts
 * @module area
 * @description Prompt for LLM-based locality/region assessment (structured output).
 * @author BharatERP
 * @created 2025-03-13
 */

export function getAreaAssessPrompt(locality: string, city: string): string {
  const place = city ? `${locality}, ${city}` : locality;
  return `You are a real estate analyst for Indian residential markets. Assess the following locality for livability and investment.

Locality: ${place}

Return a JSON object only, no other text, with these exact keys (all numbers 0-100 unless noted):
- "livabilityScore": number (0-100, overall livability)
- "connectivityScore": number (0-100, transport, metro, roads)
- "schoolsScore": number (0-100, schools and education)
- "safetyScore": number (0-100, safety and low crime)
- "priceTrendPctAnnual": number (estimated annual price trend %, e.g. 5 to 15)
- "amenitiesSummary": string (one short sentence: hospitals, parks, shopping, etc.)

Example: {"livabilityScore":78,"connectivityScore":85,"schoolsScore":72,"safetyScore":80,"priceTrendPctAnnual":10,"amenitiesSummary":"Good metro connectivity, schools within 2km, hospitals and malls nearby."}

JSON:`;
}
