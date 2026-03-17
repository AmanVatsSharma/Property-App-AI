# AI Features Inventory

**Purpose:** Reference for which agent tools are live vs "coming soon" and where AI is exposed in web and mobile.  
**Last updated:** 2026-03-17.

---

## 1. Agent tools (API)

Defined in `apps/api/src/modules/agent/services/agent-tools.service.ts`.

### Live tools (7)

| Tool | Description |
|------|-------------|
| search_properties | Search by query, location, price, BHK, type, sort; returns ToolResult with sources (property IDs). |
| get_property | Full listing by id. |
| score_property | AI score (0–100) + tip; uses AreaService; persists aiScore/aiTip. |
| get_neighbourhood_score | Livability for locality. |
| assess_region | Load/assess locality summary. |
| compare_properties | Compare 2–5 properties. |
| create_listing | Create listing for signed-in user. |

### Coming soon (4)

| Tool | Placeholder response |
|------|----------------------|
| get_price_forecast | "Price forecast for localities is coming soon..." |
| check_rera | "RERA verification is coming soon..." |
| analyze_document | "Document and legal risk analysis is coming soon..." |
| get_negotiation_advice | "Coming soon. Comparables and bid strategy..." |

---

## 2. Web AI touchpoints

| Touchpoint | Location | Behaviour |
|------------|----------|-----------|
| AI Fab | AIFab.tsx, AIFabProvider, layout | Multi-turn chat; askAgent; create_listing when signed in. |
| AI search input | SearchPageClient.tsx | Placeholder "AI Search..."; Search opens AI Fab. |
| ✦ AI Smart Match | Same | Builds prompt from filters, opens AI Fab. |
| AI score on cards | Search, detail, AI Fab results | aiScore, "✦ AI Pick" when ≥90, sort by AI Score. |
| Post-with-AI CTA | PostPropertyAICta.tsx | "Describe & post with AI →" opens Fab. |
| Landing | LandingPage.tsx | Hero + "Try AI", featured with AI score. |

---

## 3. Mobile AI touchpoints

| Touchpoint | Location | Behaviour |
|------------|----------|-----------|
| AI search bar | (tabs)/search.tsx | Placeholder + ✦; Search not wired to agent (list by location). |
| AI score on cards | Search, Home featured | aiScore, "✦ AI Pick" when ≥90. |
| Property detail | property/[id].tsx | AI score and ✦ AI Pick. |
| Post-with-AI | — | No CTA; form only. |

---

## 4. References

- Agent module: `apps/api/src/modules/agent/MODULE_DOC.md`
- Architecture (legal/forecast): `docs/architecture-legal-forecast-api.md`
- MVP plan: `docs/MVP_READINESS_PLAN.md`
