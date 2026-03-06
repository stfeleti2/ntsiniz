#!/usr/bin/env bash
set -euo pipefail

# Legal text must not ship with placeholder markers.
# This is not legal advice, but it prevents obvious store-review rejections.

TARGETS=(
  "docs/legal"
  "src/app/legal"
)

for d in "${TARGETS[@]}"; do
  if [[ ! -d "$d" ]]; then
    echo "⛔ Missing expected directory: $d" >&2
    exit 1
  fi
done

if grep -R "\b(TODO|TBD|FIXME)\b" -n "${TARGETS[@]}" >/dev/null 2>&1; then
  echo "⛔ Legal docs/text contain placeholder markers (TODO/TBD/FIXME)." >&2
  echo "\nFix: replace placeholders or remove the section until you can fill it accurately." >&2
  echo "\nMatches:" >&2
  grep -R "\b(TODO|TBD|FIXME)\b" -n "${TARGETS[@]}" >&2 || true
  exit 1
fi

echo "✔ Legal docs/text look publishable (no placeholder markers)."
