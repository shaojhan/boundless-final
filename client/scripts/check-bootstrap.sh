#!/usr/bin/env bash
# Bootstrap remnant guard — CI fails if any of these classes appear in src files
# Usage: bash scripts/check-bootstrap.sh
# Returns: 0 = clean, 1 = Bootstrap classes found (run this in CI to block new additions)

set -euo pipefail

SEARCH_DIRS="components pages hooks"
EXCLUDE_GLOB="--exclude-dir=node_modules --exclude-dir=.next --exclude=*.test.*"
FOUND=0

# run_check LABEL PATTERN [GREP_V_FILTER...]
# - strips JSX comment lines {/* ... */} automatically
# - applies any additional grep -v filters passed as extra args
run_check() {
  local label="$1"; shift
  local pattern="$1"; shift

  local matches
  matches=$(grep -rn -E "className=.*${pattern}|class=.*${pattern}" \
    $EXCLUDE_GLOB \
    --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" \
    $SEARCH_DIRS 2>/dev/null || true)

  # Strip lines where the match only appears inside a JSX block comment {/* ... */}
  matches=$(echo "$matches" | grep -Ev "\{/\*.*${pattern}" || true)

  # Apply extra -v filters passed as remaining arguments
  while [[ $# -gt 0 ]]; do
    matches=$(echo "$matches" | grep -v "$1" || true)
    shift
  done

  if [[ -n "$matches" ]]; then
    echo "BOOTSTRAP REMNANT: \"${label}\""
    echo "$matches"
    echo ""
    FOUND=1
  fi
}

# --- form utilities ---
run_check "form-control"     "form-control"
run_check "form-select"      "form-select"
# form-label: exclude col-form-label and CSS module key references
run_check "form-label"       "form-label" \
  "col-form-label" \
  "styles\[.form-label.\]"
# col-form-label: skip CSS module key references styles['col-form-label']
run_check "col-form-label"   "col-form-label" \
  "styles\[.col-form-label.\]"
run_check "input-group"      "input-group"
run_check "input-group-text" "input-group-text"

# --- buttons ---
# btn btn-: JSX comment lines already stripped above
run_check "btn btn-" "btn btn-"
# btn-primary / btn-danger: exclude project-specific b-btn-* custom classes
run_check "btn-primary"   "btn-primary"   "b-btn-primary"
run_check "btn-secondary" "btn-secondary"
run_check "btn-light"     "btn-light"
run_check "btn-danger"    "btn-danger"    "b-btn-danger"
run_check "btn-outline-"  "btn-outline-"

# --- cards ---
run_check "card-body"  "card-body"
run_check "card-title" "card-title"

# --- pagination ---
run_check "page-item" "page-item"
run_check "page-link" "page-link"

# --- Bootstrap display / layout utilities ---
run_check "d-flex"         "d-flex"
run_check "d-none"         "d-none"
run_check "d-block"        "d-block"
run_check "d-inline"       "d-inline"
run_check "container-fluid" "container-fluid"
run_check "col-sm"         "col-sm"
run_check "col-md"         "col-md"
run_check "col-lg"         "col-lg"
run_check "align-items-center"  "align-items-center"
run_check "justify-content-"    "justify-content-"

if [[ $FOUND -eq 0 ]]; then
  echo "✓ No Bootstrap class remnants found."
  exit 0
else
  echo "✗ Bootstrap class remnants detected. Please replace with Tailwind utilities."
  exit 1
fi
