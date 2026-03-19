# App: web

**Short:** Consumer-facing Next.js (App Router) app for property search, listings, EMI, legal checker, post-property, and AI-assisted flows; talks to Property-App-AI API via GraphQL and REST.

**Purpose:** Provide the main public web experience for UrbanNest.ai: landing, search and filters, property detail by id/slug, post-property with image upload, EMI calculator, legal checker, neighbourhood and price-forecast entry points, theme switching, and AI FAB. All listing/detail data comes from the API (no mock data in production); demo images are fallbacks for marketing and empty galleries.

**Files:**

- `src/app/` — App Router: `page.tsx` (landing), `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`; routes: `search/`, `property/[id]/`, `post-property/`, `emi-calculator/`, `legal-checker/`, `neighbourhood/`, `price-forecast/`, `about/`
- `src/components/` — `layout/` (Nav, Footer, AnnouncementBar, AIFab, MobileAppPrompt), `ui/` (Button, Card, Input, PropertyImage, RevealObserver, RevealOnScroll, SkipToContent), `providers/` (ThemeProvider, AuthProvider, AIFabProvider), `landing/`, `search/`, `emi/`, `post-property/`, `auth/`
- `src/lib/` — `graphql-client.ts` (property/agent queries), `property-api.ts`, `upload-api.ts`, `api-client.ts`, `copy.ts` (i18n-ready strings), `demo-images.ts`, `logger.ts`
- `src/design-system/` — `tokens.json` (design tokens)
- `e2e/` — Playwright e2e tests (e.g. `search-and-property.spec.ts`)
- `README.md` — Run, Build, Environment, features, structure
- `MODULE_DOC.md` — this file

**Change-log:**

- 2026-03-19: Footer credit line: "Powered by Vedpragya" (vedpragya.com) · "Thoughtfully built for modern real estate"; FOOTER_COPY in copy.ts; footer-credits styles.

- 2026-03-17: API client headers; neighbourhood copy and loading/error states; legal and forecast CTA; landing and search AI positioning (hero, search bar, AI Fab).

- 2026-03-14: Documentation consistency pass (canonical template and code alignment).
