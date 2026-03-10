# Property-App-AI (UrbanNest.ai)

Nx monorepo for the UrbanNest.ai property platform. The Next.js web app lives in `apps/web`.

## Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)

## Quick start

From the repo root:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts (from root)

| Script   | Command                 | Description              |
|----------|-------------------------|--------------------------|
| `dev`    | `nx run web:dev`        | Start Next.js dev server |
| `build`  | `nx run web:build`      | Production build         |
| `start`  | `nx run web:start`      | Start production server  |
| `lint`   | `nx run-many -t lint`   | Lint all projects        |

## Nx commands

- `npx nx run web:build` — build the web app (with caching)
- `npx nx run web:dev` — same as `npm run dev`
- `npx nx graph` — view project graph (if Nx Cloud or graph is enabled)

## Structure

- **apps/web** — Next.js 16 app (UrbanNest.ai front end). See [apps/web/README.md](apps/web/README.md) for routes and structure.
- **HTML/** — Original static HTML/CSS/JS; kept for reference only.
- **nx.json**, **tsconfig.base.json** — Nx workspace and shared TypeScript config.

## Docs

Changelog and module docs: [docs/CHANGELOG.md](docs/CHANGELOG.md).
