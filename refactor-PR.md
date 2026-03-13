# Refactor PR: Enterprise src structure (Phase 1)

## Summary

- **Branch**: `refactor/structure-YYYYMMDD`
- **Scope**: apps/api path aliases, refactor tooling, verify script. No renames of `modules/` or `common/errors`.

## Changes

1. **API tsconfig path aliases** — `@api/shared/*`, `@api/common/*`, `@api/modules/*`, `@api/app/*`, `@api/database/*` in `apps/api/tsconfig.app.json`.
2. **Webpack resolve** — Alias entries in `apps/api/webpack.config.js` so the bundler resolves `@api/*`.
3. **Import updates** — All cross-folder relative imports in `apps/api/src` replaced with `@api/*` aliases (within-module relative imports kept).
4. **Refactor tooling** — `refactor-scan.json`, `migration-map.json`, `scripts/refactor-verify.sh`, npm script `refactor:verify`.
5. **API test target** — `test` target in `apps/api/project.json`; `apps/api/jest.config.js` with `moduleNameMapper` for `@api/*`.

## Validation checklist

- [ ] Plan confirmed with SonuRam ji
- [ ] Module docs updated (MODULE_DOC.md) — N/A for path-only refactor
- [ ] Top-of-file headers present (unchanged)
- [ ] Madge cycle check passed: `npx madge --circular apps/api/src`
- [ ] Duplicate-file check passed
- [ ] Changelog entry included (docs/CHANGELOG.md)
- [ ] `npm run refactor:verify` passes (or known failures documented)
- [ ] `npx nx run api:build` passes
- [ ] `npx nx run api:test` passes (if Jest configured)

## Rollback

Revert the branch; no DB or external API changes. Re-exports not used in Phase 1 (no file moves).

## Post-merge

- Optional: add madge to CI for `apps/api/src`.
- Optional: Phase 2 — vertical slices (interface/application/domain) in one module as pilot.
