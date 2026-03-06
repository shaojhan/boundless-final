#!/usr/bin/env bash
# Bootstrap remnant guard — CI fails if any of these classes appear in src files
# Usage: bash scripts/check-bootstrap.sh
# Returns: 0 = clean, 1 = Bootstrap classes found (run this in CI to block new additions)

set -euo pipefail

PATTERNS=(
  "form-control"
  "form-select"
  "col-form-label"
  "input-group"
  "input-group-text"
  "btn btn-"
  "btn-primary"
  "btn-secondary"
  "btn-light"
  "btn-danger"
  "btn-outline-"
  "card-body"
  "card-title"
  "page-item"
  "page-link"
  "d-flex"
  "d-none"
  "d-block"
  "d-inline"
  "container-fluid"
  "col-sm"
  "col-md"
  "col-lg"
  "align-items-center"
  "justify-content-"
)

SEARCH_DIRS="components pages hooks"
EXCLUDE_GLOB="--exclude-dir=node_modules --exclude-dir=.next --exclude=*.test.*"
FOUND=0

for pattern in "${PATTERNS[@]}"; do
  # Only check className/class attributes (not comments or variable names)
  matches=$(grep -rn "className=.*${pattern}\|class=.*${pattern}" \
    $EXCLUDE_GLOB \
    --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" \
    $SEARCH_DIRS 2>/dev/null || true)
  if [[ -n "$matches" ]]; then
    echo "BOOTSTRAP REMNANT: \"${pattern}\""
    echo "$matches"
    echo ""
    FOUND=1
  fi
done

if [[ $FOUND -eq 0 ]]; then
  echo "✓ No Bootstrap class remnants found."
  exit 0
else
  echo "✗ Bootstrap class remnants detected. Please replace with Tailwind utilities."
  exit 1
fi
