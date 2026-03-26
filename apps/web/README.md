# KonKreet — Next.js App

Consumer-facing Next.js app for property search, listings, EMI calculator, legal checker, and post-property flow. Uses App Router, Tailwind, and GraphQL/REST to the Property-App-AI API.

## Run

From **repo root** (Nx monorepo):

```bash
npm install   # if needed
npm run dev
```

Or from this app: `nx run web:dev`.

Open [http://localhost:3000](http://localhost:3000).

## Build

From repo root: `npm run build` then `npm run start`. Or: `nx run web:build`, `nx run web:start`.

## Environment

Copy the project’s `.env.example` (see repo root [.env.example](../../.env.example) or `apps/web/.env.example` if present) to `apps/web/.env.local`. Set at least:

- `NEXT_PUBLIC_API_URL` — API base URL (e.g. `http://localhost:3333`)
- `NEXT_PUBLIC_GRAPHQL_HTTP` — GraphQL endpoint (e.g. `http://localhost:3333/graphql`), or derived from `NEXT_PUBLIC_API_URL` + `/graphql`

Optional: `NEXT_PUBLIC_APP_STORE_URL`, `NEXT_PUBLIC_PLAY_STORE_URL` for app-download links.

## Theme

Light/dark theme switching is powered by **next-themes** (class-based on `html`). Use the sun/moon toggle in the nav to switch; preference is persisted in `localStorage` under `konkreet-theme`.

## Responsive

The app is mobile-responsive. Breakpoints: **639px** (small mobile), **1024px** (tablet/desktop). Below 1024px the main nav becomes a hamburger that opens a slide-in drawer with all links, theme toggle, Sign In, and Post Free. Layouts (sections, footer, search, property detail, EMI, post-property, about) use single- or two-column grids on small screens; padding is reduced (16px) on mobile. Touch targets are at least 44px; the AI FAB respects safe-area insets. On viewports ≤768px, a dismissible banner invites users to download the app or continue on device (sessionStorage dismissal). Test at 320px–1024px in DevTools device toolbar.

## Main features and entry points

- **Landing** (`/`) — Hero, search, city explorer, listings, AI score, features, map, testimonials, app CTA
- **Search** (`/search`) — Property search with filters and grid; results from GraphQL
- **Property detail** (`/property/[id]`) — Dynamic page by id: gallery, specs, tabs, contact. All property links use `/property/${id}` (no `/property/detail`). E2E and user flows use API-backed search → click a card → `/property/[id]`; no static slugs or mock listing data in production.
- **Post property** (`/post-property`) — Listing form and pricing; image upload via upload-api
- **EMI calculator** (`/emi-calculator`) — Loan/EMI calculator with sliders
- **Legal checker** (`/legal-checker`) — RERA search and document upload
- **About** (`/about`) — Mission, team, funding, investors, press
- **Neighbourhood** (`/neighbourhood`) — Neighbourhood score explorer
- **Price forecast** (`/price-forecast`) — Price forecast by locality

Links to API health and docs: see repo [docs/](../../docs/) and API README.

## Structure

- `src/app/` — App Router pages, layout, loading, error, not-found
- `src/app/globals.css` — Design tokens and shared styles
- `src/components/layout/` — Nav, Footer, AnnouncementBar, AIFab, MobileAppPrompt
- `src/components/ui/` — Button, Card, Input, PropertyImage, RevealObserver, RevealOnScroll, SkipToContent
- `src/components/providers/` — ThemeProvider, AuthProvider, AIFabProvider
- `src/components/landing/` — LandingPage
- `src/components/search/` — SearchPageClient, PropertyMap
- `src/components/emi/` — EMICalculatorClient
- `src/components/post-property/` — PostPropertyForm, PostPropertyAICta
- `src/components/auth/` — LoginModal
- `src/lib/` — `graphql-client` (property/agent queries), `property-api`, `upload-api`, `api-client`, `copy` (i18n-ready strings), `demo-images`, `logger`

Internal links use Next.js `Link`; Nav uses `usePathname()` for active state.

## Demo images

For a presentable demo, the app uses high-quality placeholder images from **Unsplash** (no API key required for static URLs). These are defined in `src/lib/demo-images.ts`: city skylines for the “Explore by City” section and property covers/galleries for listing cards, search results, and the property detail gallery. DEMO_IMAGES are used only as fallback when the API returns no image URLs and for marketing/landing; listing and detail data come from GraphQL only (no mock listing data). All property links use `/property/[id]`; there is no `/property/detail` or static slug in production. E2E tests use the API-backed flow: `/search` then click a card to open `/property/[id]`. When no image is available, the UI falls back to gradients and emoji placeholders. To use local assets instead, add images under `public/demo/` and point the demo-image constants to paths like `/demo/cities/mumbai.jpg`.
