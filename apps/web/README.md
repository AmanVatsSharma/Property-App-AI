# UrbanNest.ai — Next.js App

This is the Next.js conversion of the UrbanNest.ai static site. The original HTML, CSS, and JS files remain in the parent directory for reference.

## Run locally

From **repo root** (Nx monorepo):

```bash
npm install   # if needed
npm run dev
```

Or from this directory: `nx run web:dev`.

Open [http://localhost:3000](http://localhost:3000).

## Build

From repo root: `npm run build` then `npm run start`. Or: `nx run web:build`, `nx run web:start`.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing (hero, search, city explorer, listings, AI score, features, map, testimonials, app CTA) |
| `/search` | Property search with filters and grid |
| `/about` | About, mission, team, funding, investors, press |
| `/property/detail` | Property detail (gallery, specs, tabs, contact sidebar) |
| `/post-property` | Post property form and pricing plans |
| `/emi-calculator` | EMI & loan calculator with sliders |
| `/legal-checker` | RERA search and document upload |
| `/neighbourhood` | Neighbourhood score explorer |
| `/price-forecast` | Price forecast by locality |

## Structure

- `src/app/` — App Router pages and layout
- `src/app/globals.css` — Design tokens and shared + page-specific styles
- `src/components/layout/` — AnnouncementBar, Nav, Footer, AIFab
- `src/components/ui/` — RevealObserver (scroll-triggered reveal)
- `src/components/landing/` — LandingPage
- `src/components/search/` — SearchPageClient
- `src/components/emi/` — EMICalculatorClient

All internal links use Next.js `Link`. Nav uses `usePathname()` for active state; scroll-based nav class and reveal-on-scroll are handled in layout and RevealObserver.
