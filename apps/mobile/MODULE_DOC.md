# mobile

Native iOS/Android application for UrbanNest.ai (Property-App-AI), built with Expo, React Native, NativeWind (Tailwind), and TypeScript.

## Purpose

- Deliver the same product flows as the web app (landing, search, property detail, post property, tools) on iOS and Android.
- Reuse branding and design tokens (dark theme, teal primary, radius) from web via NativeWind `tailwind.config.js`.

## Flows

1. **Home (Landing)** — Hero, search CTA, city cards, featured listing, bottom CTAs (Search, Post Property).
2. **Search** — AI search bar, property list; tap card → Property detail.
3. **Post** — Post property hero, benefits, steps, pricing, Step 1 form.
4. **More** — Tools list → About, EMI Calculator, Legal Checker, Neighbourhood Score, Price Forecast.
5. **Property detail** — Breadcrumb, gallery, specs, overview, AI score, contact (Call / WhatsApp).

## Navigation

- **Tabs:** Home, Search, Post, More (bottom tab bar).
- **Stack (root):** (tabs), property/[id], modal.
- **Stack (More):** index (tools list), about, emi-calculator, legal-checker, neighbourhood, price-forecast.

## Key files

- `app/_layout.tsx` — Root layout; global CSS import; UrbanNest dark theme; Stack (tabs + property + modal).
- `app/(tabs)/_layout.tsx` — Tab bar (Home, Search, Post, More).
- `app/(tabs)/index.tsx` — Landing.
- `app/(tabs)/search.tsx` — Search and property list.
- `app/(tabs)/post.tsx` — Post property.
- `app/(tabs)/more/_layout.tsx` — More stack.
- `app/(tabs)/more/index.tsx` — Tools list.
- `app/property/[id].tsx` — Property detail.
- `global.css` — Tailwind base/components/utilities.
- `tailwind.config.js` — Theme (colors, radius) aligned with web.
- `metro.config.js` — NativeWind Metro integration.
- `babel.config.js` — NativeWind Babel preset.

## Changelog

- 2025-03-10: Initial module. Expo app with NativeWind; tabs and stack navigation; Landing, Search, Post, More (with tools), Property detail; design tokens aligned with web.
