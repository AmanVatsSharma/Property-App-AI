/**
 * @file search-parse.prompt.ts
 * @module search
 * @description Prompt for LLM to parse natural-language property search into structured filters.
 * @author BharatERP
 * @created 2026-03-17
 */

export function getSearchParsePrompt(query: string): string {
  return `You are a real estate search parser for Indian residential property. Parse the user's natural language search into a JSON object.

User query: "${query}"

Return a JSON object only, no other text, with these optional keys:
- "location": string (city or locality, e.g. "Bangalore", "Whitefield")
- "bedrooms": number (BHK, e.g. 2 or 3)
- "minPrice": number (min budget in INR, e.g. 5000000 for 50 lakh)
- "maxPrice": number (max budget in INR, e.g. 10000000 for 1 Cr)
- "type": string (one of: apartment, villa, plot, builder-floor, office, pg)
- "schoolsScoreMin": number (0-100, set to 60 or 70 when user wants "near school" or "good schools")
- "connectivityScoreMin": number (0-100, set to 70 when user wants "near metro" or "good connectivity/transport")

Rules:
- Only include keys that you can infer from the query.
- For "near school" or "schools nearby" set schoolsScoreMin to 60.
- For "near metro" or "metro connectivity" or "good transport" set connectivityScoreMin to 70.
- Prices: "lakh" = * 100000, "Cr" or "crore" = * 10000000.

Example for "3 BHK near school near metro in Bangalore under 1 Cr":
{"location":"Bangalore","bedrooms":3,"maxPrice":10000000,"schoolsScoreMin":60,"connectivityScoreMin":70}

JSON:`;
}
