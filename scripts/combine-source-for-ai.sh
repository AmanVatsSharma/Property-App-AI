#!/usr/bin/env bash
#
# combine-source-for-ai.sh — Bundle API and web app source into single files for external AI.
# Excludes tests, docs, jest mocks, e2e. Run from repo root.
# Output: scripts/ai-bundle/api-source-bundle.txt, scripts/ai-bundle/web-source-bundle.txt
#
set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
BUNDLE_DIR="$REPO_ROOT/scripts/ai-bundle"
mkdir -p "$BUNDLE_DIR"

# Returns 0 if file should be excluded from API bundle
should_exclude_api() {
  local path="$1"
  [[ "$path" == *"__tests__"* ]] && return 0
  [[ "$path" == *".spec.ts" ]] && return 0
  [[ "$path" == *"MODULE_DOC.md" ]] && return 0
  [[ "$path" == *"README.md" ]] && return 0
  [[ "$path" == *".gitkeep" ]] && return 0
  return 1
}

# Returns 0 if file should be excluded from web bundle
should_exclude_web() {
  local path="$1"
  [[ "$path" == *"__tests__"* ]] && return 0
  [[ "$path" == *"/test/"* ]] && return 0
  [[ "$path" == *".spec.ts" ]] && return 0
  [[ "$path" == *".spec.tsx" ]] && return 0
  [[ "$path" == *"MODULE_DOC.md" ]] && return 0
  [[ "$path" == *"README.md" ]] && return 0
  return 1
}

api_out="$BUNDLE_DIR/api-source-bundle.txt"
web_out="$BUNDLE_DIR/web-source-bundle.txt"

echo "[combine-source-for-ai] Building API bundle..."
: > "$api_out"
while IFS= read -r -d '' f; do
  rel="${f#$REPO_ROOT/}"
  should_exclude_api "$rel" && continue
  echo "" >> "$api_out"
  echo "===================== $rel =====================" >> "$api_out"
  echo "" >> "$api_out"
  cat "$f" >> "$api_out"
  echo "" >> "$api_out"
done < <(find apps/api/src -type f -name "*.ts" -print0 | sort -z)

echo "[combine-source-for-ai] Building web bundle..."
: > "$web_out"
while IFS= read -r -d '' f; do
  rel="${f#$REPO_ROOT/}"
  should_exclude_web "$rel" && continue
  echo "" >> "$web_out"
  echo "===================== $rel =====================" >> "$web_out"
  echo "" >> "$web_out"
  cat "$f" >> "$web_out"
  echo "" >> "$web_out"
done < <(find apps/web/src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" \) -print0 | sort -z)

api_lines=$(wc -l < "$api_out")
web_lines=$(wc -l < "$web_out")
echo "[combine-source-for-ai] Done. API: $api_out ($api_lines lines) | Web: $web_out ($web_lines lines)"
