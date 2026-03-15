# Module: shared

**Short:** Shared design tokens, types, navigation config, and GraphQL client used by web (Next.js) and mobile (Expo).

**Purpose:**

- Provide a single source for branding and layout so web and mobile stay consistent.
- **tokens/theme:** Colors and radius matching `apps/web` globals.css (dark and light palettes).
- **types/navigation:** Nav and footer link structures so both platforms use the same routes and labels.
- **types/property:** Property card shape and search tab config for listings and filters.
- **graphql/client:** Minimal `runGraphQL` helper for web and mobile to call the API with fetch; supports requestId for correlation.

**Files:**

- `src/index.ts` — Re-exports tokens, nav/property types, and runGraphQL/GraphQLResponse.
- `src/tokens/theme.ts` — Design tokens: `colors`, `colorsLight`, `radius`, `theme`, `themeLight` (mirrors web globals.css).
- `src/types/navigation.ts` — `NAV_LINKS`, `FOOTER_LINKS` (discover, tools, company).
- `src/types/property.ts` — `PropertyCard` interface and `SEARCH_TABS` constant for search UI.
- `src/graphql/client.ts` — `runGraphQL<T>(url, { query, variables?, headers?, requestId? })` and `GraphQLResponse<T>` type.

**Dependencies:** None (no runtime deps in package.json).

**Env vars:** None.

**Change-log:**

- 2026-03-14: Documentation consistency pass (canonical template and code alignment).
- 2025-03-12: Added graphql/client (runGraphQL) for web and mobile GraphQL API calls. Web and mobile now use shared NAV_LINKS, FOOTER_LINKS, SEARCH_TABS where applicable.
- 2025-03-10: Initial module; theme tokens, nav config, property types.
