#!/usr/bin/env bash
# refactor-verify.sh — Run lint, build, tests, and madge cycle check for refactor validation.
# Exit non-zero on first failure. Run from repo root.

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "[refactor-verify] Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
  echo "[refactor-verify] WARN: Working tree is not clean. Continuing anyway."
fi

echo "[refactor-verify] Running lint (nx run-many -t lint --all)..."
npx nx run-many -t lint --all || { echo "[refactor-verify] Lint failed."; exit 1; }

echo "[refactor-verify] Building API..."
npx nx run api:build || { echo "[refactor-verify] API build failed."; exit 1; }

echo "[refactor-verify] Building web..."
npx nx run web:build || { echo "[refactor-verify] Web build failed."; exit 1; }

if npx nx show project api --json 2>/dev/null | grep -q '"test"'; then
  echo "[refactor-verify] Running API tests..."
  npx nx run api:test || { echo "[refactor-verify] API tests failed."; exit 1; }
else
  echo "[refactor-verify] Skipping API tests (no test target)."
fi

echo "[refactor-verify] Running madge cycle check on apps/api/src..."
if command -v npx &>/dev/null; then
  npx madge --circular apps/api/src || { echo "[refactor-verify] Madge found circular dependencies."; exit 1; }
else
  echo "[refactor-verify] Skipping madge (npx not available)."
fi

echo "[refactor-verify] All checks passed."
