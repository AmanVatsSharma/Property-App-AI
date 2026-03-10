---
name: HTML to Next.js Conversion
overview: Convert the existing UrbanNest.ai static site (10 HTML pages, shared.css, shared.js) into a proper Next.js app with App Router, shared layout (nav/footer), global styles, and client-side behavior reimplemented in React.
todos: []
isProject: false
---

# Convert UrbanNest.ai Static Site to Next.js App

## Current State Summary

- **10 HTML pages:** `urbannest-ai.html` (landing, self-contained), `search.html`, `about.html`, `property-detail.html`, `post-property.html`, `emi-calculator.html`, `legal-checker.html`, `neighbourhood.html`, `price-forecast.html`.
- **Shared assets:** [shared.css](shared.css) (design tokens, nav, footer, cards, forms, reveal), [shared.js](shared.js) (injectNav, injectFooter, revealOnScroll).
- **Landing** ([urbannest-ai.html](urbannest-ai.html)) has ~600 lines of inline CSS and inline script (nav scroll, search tabs, hearts, score bar animation, reveal on scroll, typewriter placeholder). Other pages use shared.css + shared.js and page-specific `<style>` blocks.

## Recommended Approach

- **Next.js 14+ with App Router** for file-based routing and shared layout.
- **Preserve existing look and feel:** Keep CSS variables and current styling (from shared.css + page-specific styles). Optionally migrate to Tailwind/shadcn later per [uirules.mdc](.cursor/rules/uirules.mdc); not required for initial conversion.
- **Single root layout** with Nav, optional AnnouncementBar, Footer, and AI FAB; page content in `children`.

---

## 1. Project Setup

- In project root (or a new `app/` or `web/` subfolder if you want to keep HTML files for reference), run `npx create-next-app@latest` with TypeScript, ESLint, App Router, no Turbopack (optional), `src/` directory, and import alias `@/`*.
- Add global fonts (e.g. next/font): Playfair Display, Outfit (already used in HTML).
- Create `src/app/layout.tsx`: root layout with `<html>`, `<body>`, font classes, and a single shared layout wrapper that renders Nav, optional AnnouncementBar, `{children}`, Footer, and AI FAB.

---

## 2. Global Styles and Design Tokens

- Add `src/app/globals.css`: merge [shared.css](shared.css) (reset, `:root` variables, nav, footer, section utils, cards, buttons, badges, form elements, tabs, reveal, footer, AI FAB, breadcrumb, page-hero, grid utils). Keep all `--night`, `--teal`, `--coral`, etc.
- Ensure `globals.css` is imported in root layout. No duplicate token definitions.

---

## 3. Shared Layout Components

Implement as React/Next.js components (not DOM injection):


| Component           | Source                                          | Notes                                                                                                                                                               |
| ------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AnnouncementBar** | `shared.js` ann-bar HTML + landing announcement | Optional; can be toggled via env or layout.                                                                                                                         |
| **Nav**             | `shared.js` nav + landing nav structure         | Use `usePathname()` to set active link (Buy, Rent, New Projects, Commercial, AI Copilot, Market Pulse). Logo → `/`, Sign In / Post Free → `/post-property` or auth. |
| **Footer**          | `shared.js` injectFooter HTML                   | Same columns: Discover, AI Tools, Company, Legal. Links use `Link` with `/search`, `/about`, `/emi-calculator`, etc.                                                |
| **AIFab**           | shared.js / landing AI widget                   | Fixed bottom-right FAB; optional chat bubble.                                                                                                                       |


All internal links must use Next.js `Link` with `href` like `/`, `/search`, `/about`, `/property/...`, `/post-property`, `/emi-calculator`, `/legal-checker`, `/neighbourhood`, `/price-forecast`.

---

## 4. Route Structure (App Router)


| Route                                  | Source file          | Purpose                                                                                                                             |
| -------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                    | urbannest-ai.html    | Landing: hero, search mega, city explorer, listings, AI score panel, features, map, metrics, testimonials, app CTA, final CTA       |
| `/search`                              | search.html          | Search layout: top bar, filters sidebar, property grid, pagination                                                                  |
| `/about`                               | about.html           | About hero, mission, impact, team, funding timeline, investors, press                                                               |
| `/property/[id]` or `/property/detail` | property-detail.html | Property detail: gallery, specs, tabs, sidebar (contact, AI score). Start with single slug e.g. `detail`; param later for real IDs. |
| `/post-property`                       | post-property.html   | Post property: hero, benefits, pricing cards, form                                                                                  |
| `/emi-calculator`                      | emi-calculator.html  | EMI form, result hero, donut, amortization, bank comparison                                                                         |
| `/legal-checker`                       | legal-checker.html   | RERA search, result card, checklist, doc upload                                                                                     |
| `/neighbourhood`                       | neighbourhood.html   | City selector, compare localities, score table, signals, nearby                                                                     |
| `/price-forecast`                      | price-forecast.html  | Input panel, chart, forecast badges, drivers, comparable sales                                                                      |


Implement one page per `src/app/<route>/page.tsx` (or `page.jsx`). For `/property/[id]`, use a dynamic segment and pass `id` to the page (e.g. placeholder data by id).

---

## 5. Page-Specific Styles

- For each route, either:
  - **Option A:** Add a dedicated CSS Module `page.module.css` next to `page.tsx` and migrate the inline `<style>` from the corresponding HTML into it, or
  - **Option B:** Put page-specific selectors in `globals.css` under a comment per page (simpler, less modular).
- Prefer **Option A** for maintainability. Ensure class names from the original HTML are preserved so markup can stay close to original (e.g. `.search-layout`, `.sidebar`, `.prop-card`).

---

## 6. Client-Side Behavior (shared.js + landing script)

Replace vanilla JS with React:

- **Nav scroll class:** In `Nav` component, `useEffect` + `window.addEventListener('scroll', ...)` to toggle `scrolled` on nav (or use a small `useScrollPosition` hook).
- **Reveal on scroll:** Create a `RevealOnScroll` component (or hook) that uses `IntersectionObserver` to add `visible` to elements with class `reveal`; use in layout or wrap sections in pages that use `.reveal`.
- **Landing-only:** Search tabs (Buy/Rent/New Projects/etc.): local state for `activeTab`. Typewriter placeholder: `useState` + `setInterval` to cycle placeholder text. Heart toggles: local state or callback on card components. Score bar animation: run when section is in view (e.g. same observer as reveal).
- **Search page:** Filter buttons (BHK, property type): state; view toggle (grid/list/map): state; heart toggles: state per card. Range inputs: controlled components.
- **Other pages:** Any tab/accordion/button toggles → React state. Form inputs → controlled components where needed.

Keep existing behavior; no new features in this conversion.

---

## 7. Assets and Metadata

- Add `metadata` (title, description) in each route’s `page.tsx` or in layout where appropriate.
- Favicon: add to `src/app/` if available.
- Images: if the site currently uses emoji or gradients only, no image migration. If you add real images later, use `next/image` and place files under `public/` or `src/`.

---

## 8. File and Folder Structure (Suggested)

```
src/
  app/
    layout.tsx           # Root layout, fonts, Nav, Footer, AI FAB
    globals.css          # Merged shared.css + tokens
    page.tsx             # Landing (from urbannest-ai.html)
    search/
      page.tsx
      page.module.css    # search.html inline styles
    about/
      page.tsx
      page.module.css
    property/
      [id]/
        page.tsx         # or detail/page.tsx initially
      ...
    post-property/
    emi-calculator/
    legal-checker/
    neighbourhood/
    price-forecast/
  components/
    layout/
      AnnouncementBar.tsx
      Nav.tsx
      Footer.tsx
      AIFab.tsx
    ui/
      RevealOnScroll.tsx  # optional wrapper for .reveal
```

---

## 9. What Stays the Same

- All design tokens and visual styling (colors, spacing, typography).
- Copy and structure of each page (sections, headings, cards).
- Links between pages (mapped to new routes).
- No backend or API in this phase; all data can remain static/hardcoded as in current HTML.

---

## 10. Optional Follow-Ups (Out of Scope for Initial Plan)

- Migrate to Tailwind + shadcn per [uirules.mdc](.cursor/rules/uirules.mdc) (design tokens in tailwind.config, ThemeProvider).
- Add API routes or server components for real property/search data.
- Add `docs/CHANGELOG.md` and update per workspace rules after implementation.

---

## Implementation Order

1. Create Next.js app and install deps.
2. Add `globals.css` (shared.css + tokens).
3. Implement layout components (AnnouncementBar, Nav, Footer, AIFab) and root layout.
4. Implement landing page (`/`) from urbannest-ai.html (sections + client behavior).
5. Implement remaining routes one by one (search, about, property, post-property, emi-calculator, legal-checker, neighbourhood, price-forecast), moving page-specific CSS into modules and behavior into React state/effects.
6. Verify all internal links and scroll/reveal behavior.
7. Add per-route metadata and favicon if needed.

