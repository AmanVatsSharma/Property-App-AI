# AI Features Inventory

**Purpose:** Reference for which agent tools are live vs "coming soon" and where AI is exposed in web and mobile.  
**Last updated:** 2026-05-07.

---

## 1. Agent tools (API)

Defined in `apps/api/src/modules/agent/services/agent-tools.service.ts`.

### Live tools (11)

| Tool | Description |
|------|-------------|
| search_properties | Search by query, location, price, BHK, type, sort; **schools_score_min** / **connectivity_score_min** for "near school"/"near metro"; returns ToolResult with sources (property IDs). |
| get_property | Full listing by id. |
| score_property | AI score (0–100) + tip; uses AreaService; persists aiScore/aiTip. |
| get_neighbourhood_score | Livability for locality. |
| assess_region | Load/assess locality summary. |
| compare_properties | Compare 2–5 properties. |
| create_listing | Create listing for signed-in user. |
| get_price_forecast | LLM-backed locality price forecast (12/24/36-month appreciation %, demand signal, rationale). Backed by `PriceForecastService`. Deterministic fallback when no AI provider key. |
| check_rera | RERA registration check for a project / builder. Returns status, project & builder name, state, deep-link to the relevant state RERA portal, and next-step guidance. **Never fabricates registration numbers** — when uncertain, status is `unknown` and the user is pointed at the official portal. Backed by `ReraCheckService`. |
| analyze_document | Buyer-side legal document review (Sale Deed, Title Report, NOC, Encumbrance Certificate, Agreement to Sell). Surfaces red/yellow/green flags by category, positives, and recommended next actions. Always returns the disclaimer that this is not legal advice. Backed by `DocumentAnalysisService`. |
| get_negotiation_advice | Suggests an offer (₹) and bid strategy for a property using listing data + locality intelligence + price forecast. Suggested offer is clamped to **[ask × 0.85, ask × 1.00]** as a defence against bad LLM output. Returns negotiation script + walk-away conditions. Backed by `NegotiationAdvisorService`. |

### Coming soon (0)

All previously placeholder agent tools have shipped real implementations as of 2026-05-07. Future work tracked under "Listing enrichment" below (AI text + image analysis on create/update).

---

## 2. Web AI touchpoints

| Touchpoint | Location | Behaviour |
|------------|----------|-----------|
| AI Fab | AIFab.tsx, AIFabProvider, layout | Multi-turn chat; askAgent; create_listing when signed in. |
| AI search input | SearchPageClient.tsx | Placeholder "AI Search..."; Submit can call **POST /api/v1/search** or **searchPropertiesByQuery** for one-shot NL results; "✦ AI Search" opens AI Fab. |
| ✦ AI Smart Match | Same | Builds prompt from filters, opens AI Fab. |
| AI score on cards | Search, detail, AI Fab results | aiScore, "✦ AI Pick" when ≥90, sort by AI Score. |
| Post-with-AI CTA | PostPropertyAICta.tsx | "Describe & post with AI →" opens Fab. |
| Landing | LandingPage.tsx | Hero + "Try AI", featured with AI score. |
| Neighbourhood | NeighbourhoodExplorerClient.tsx | Calls `GET /api/v1/neighbourhood` for locality scores; backend area assessment (LLM when configured); loading/error/connect-API states; no mock data. |

---

## 3. Mobile AI touchpoints

| Touchpoint | Location | Behaviour |
|------------|----------|-----------|
| AI search bar | (tabs)/search.tsx | Placeholder + ✦; Search not wired to agent (list by location). |
| AI score on cards | Search, Home featured | aiScore, "✦ AI Pick" when ≥90. |
| Property detail | property/[id].tsx | AI score and ✦ AI Pick. |
| Post-with-AI | — | No CTA; form only. |

---

## 4. NL search (one-shot)

| Endpoint / Query | Behaviour |
|------------------|-----------|
| **POST /api/v1/search** | Body `{ query: string }`. SearchParserService (LLM) parses to location, BHK, price, type, schoolsScoreMin, connectivityScoreMin; returns property list. Public. |
| **GraphQL searchPropertiesByQuery(query: String)** | Same parsing and filter; returns `[Property]`. |

## 5. Listing enrichment (create/update)

| Feature | Status |
|---------|--------|
| Geocoding (lat/lng) | Live: GeocodingService on create/update. |
| Area resolution (areaId, locality, city) | Live: reverse geocode + AreaService.getOrCreate. |
| Nearby POIs (nearbyAmenities) | Live: NearbyService (Mapbox proximity) on create/update when lat/lng present. |
| AI listing text analysis | Planned: extract BHK, type, specs from title/description. |
| AI image analysis | Planned: vision tags (room type, amenities). |

## 6. References

- Agent module: `apps/api/src/modules/agent/MODULE_DOC.md`
- **LLM token logs and Claude cost estimates:** `docs/llm-token-billing.md`
- Architecture (legal/forecast): `docs/architecture-legal-forecast-api.md`
- MVP plan: `docs/MVP_READINESS_PLAN.md`
