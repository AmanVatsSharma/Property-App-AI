# Changelog

## [Unreleased]

### Added

- **Nx monorepo** — Repo converted to Nx workspace. Root `package.json` with workspaces `["apps/*"]`, `nx.json` for cache and task defaults, and `tsconfig.base.json` for shared TypeScript config.
- **apps/web** — Next.js app moved from `web/` to `apps/web`. Same UrbanNest.ai app (App Router, layout, routes); now managed by Nx with `@nx/next` plugin. Root scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint` run via Nx.

### Changed

- Next.js app location: `web/` → `apps/web/`.
- `apps/web/tsconfig.json` now extends `../../tsconfig.base.json`; app path alias `@/*` unchanged.
- Build/serve/lint executed from repo root using Nx (with caching).

### Technical

- Nx 21 + `@nx/next` plugin. Project `web` discovered from `apps/web`; targets inferred from package scripts and Next plugin. Second `nx run web:build` uses cache.
