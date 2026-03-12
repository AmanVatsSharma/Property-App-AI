# shared

Shared design tokens, types, and navigation config used by web (Next.js) and mobile (Expo) apps.

## Purpose

- **tokens/theme**: Colors and radius matching `apps/web/src/app/globals.css` for consistent branding.
- **types/navigation**: Nav links and footer links so both platforms use the same structure.
- **types/property**: Property card shape and search tab config.

## Changelog

- 2025-03-12: Added graphql/client (runGraphQL) for web and mobile GraphQL API calls. Web and mobile now use shared NAV_LINKS, FOOTER_LINKS, SEARCH_TABS where applicable.
- 2025-03-10: Initial module; theme tokens, nav config, property types.
