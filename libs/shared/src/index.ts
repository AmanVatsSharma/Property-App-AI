/**
 * @file index.ts
 * @module shared
 * @description Shared tokens, types, and config for web and mobile
 * @author BharatERP
 * @created 2025-03-10
 */

export { colors, radius, theme } from './tokens/theme';
export { NAV_LINKS, FOOTER_LINKS } from './types/navigation';
export type { PropertyCard } from './types/property';
export { SEARCH_TABS } from './types/property';
export { runGraphQL } from './graphql/client';
export type { GraphQLResponse } from './graphql/client';
