# Property-App-AI (UrbanNest.ai)

Nx monorepo for the UrbanNest.ai property platform. **Web** app in `apps/web` (Next.js). **Native mobile** app in `apps/mobile` (Expo + React Native + NativeWind).

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

| Script           | Command                   | Description                |
|------------------|---------------------------|----------------------------|
| `dev`            | `nx run web:dev`          | Start Next.js dev server   |
| `build`          | `nx run web:build`        | Production build (web)     |
| `start`          | `nx run web:start`        | Start production server    |
| `mobile`         | `nx run mobile:start`     | Start Expo (mobile)       |
| `mobile:ios`     | `nx run mobile:run-ios`   | Run on iOS simulator      |
| `mobile:android` | `nx run mobile:run-android` | Run on Android emulator |
| `lint`           | `nx run-many -t lint`     | Lint all projects         |

## Nx commands

- `npx nx run web:build` — build the web app (with caching)
- `npx nx run web:dev` — same as `npm run dev`
- `npx nx graph` — view project graph (if Nx Cloud or graph is enabled)

## Structure

- **apps/web** — Next.js 16 app (UrbanNest.ai web). See [apps/web/README.md](apps/web/README.md).
- **apps/mobile** — Expo (React Native) app with NativeWind. See [apps/mobile/README.md](apps/mobile/README.md).
- **libs/shared** — Shared design tokens and types for web and mobile.
- **HTML/** — Original static HTML; reference only.
- **nx.json**, **tsconfig.base.json** — Nx workspace and shared TypeScript config.

## Docs

Changelog and module docs: [docs/CHANGELOG.md](docs/CHANGELOG.md).
