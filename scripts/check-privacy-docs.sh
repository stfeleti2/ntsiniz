#!/usr/bin/env bash
set -euo pipefail

# Fail if privacy docs still contain TODO markers.
# This prevents "store forms don't match reality" drift.

TARGETS=("docs/privacy")
PATTERN='TODO|TBD|FIXME'

FOUND=0
for t in "${TARGETS[@]}"; do
  if [ -d "$t" ]; then
    while IFS= read -r match; do
      echo "Privacy doc marker found: $match"
      FOUND=1
    done < <(grep -RIn --exclude-dir=node_modules -E "$PATTERN" "$t" || true)
  fi
done

if [ "$FOUND" -ne 0 ]; then
  echo "\n✖ Privacy docs still contain TODO/TBD/FIXME markers. Complete docs/privacy/* before shipping."
  exit 1
fi

echo "✔ Privacy docs look complete."
