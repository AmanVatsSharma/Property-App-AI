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

## Theme

Light/dark theme switching is powered by **next-themes** (class-based on `html`). Use the sun/moon toggle in the nav to switch; preference is persisted in `localStorage` under `urbannest-theme`.

## Responsive

The app is mobile-responsive. Breakpoints: **639px** (small mobile), **1024px** (tablet/desktop). Below 1024px the main nav becomes a hamburger that opens a slide-in drawer with all links, theme toggle, Sign In, and Post Free. Layouts (sections, footer, search, property detail, EMI, post-property, about) use single- or two-column grids on small screens; padding is reduced (16px) on mobile. Touch targets are at least 44px; the AI FAB respects safe-area insets. Test at 320px–1024px in DevTools device toolbar.

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
- `src/components/providers/` — ThemeProvider (next-themes wrapper)
- `src/components/layout/` — AnnouncementBar, Nav, Footer, AIFab
- `src/components/ui/` — RevealObserver (scroll-triggered reveal)
- `src/components/landing/` — LandingPage
- `src/components/search/` — SearchPageClient
- `src/components/emi/` — EMICalculatorClient

All internal links use Next.js `Link`. Nav uses `usePathname()` for active state; scroll-based nav class and reveal-on-scroll are handled in layout and RevealObserver.

## Demo images

For a presentable demo, the app uses high-quality placeholder images from **Unsplash** (no API key required for static URLs). These are defined in `src/lib/demo-images.ts`: city skylines for the “Explore by City” section and property covers/galleries for listing cards, search results, and the property detail gallery. When the API or mock does not provide image URLs, the UI falls back to gradients and emoji placeholders. To use local assets instead, add images under `public/demo/` and point the demo-image constants to paths like `/demo/cities/mumbai.jpg`.
