#!/usr/bin/env bash
set -euo pipefail

# Fail if any UI-facing TODO/FIXME strings remain in screens/components.
PATTERN='TODO:|FIXME:'

TARGETS=("src/app/screens" "src/ui")

FOUND=0
for t in "${TARGETS[@]}"; do
  if [ -d "$t" ]; then
    while IFS= read -r match; do
      # Skip pure comments.
      line_content=$(echo "$match" | cut -d: -f3-)
      if echo "$line_content" | grep -E '^\s*\/\/' >/dev/null 2>&1; then
        continue
      fi
      echo "UI TODO found: $match"
      FOUND=1
    done < <(grep -RIn --exclude-dir=node_modules -E "$PATTERN" "$t" || true)
  fi
done

if [ "$FOUND" -ne 0 ]; then
  echo "\n✖ UI TODO strings detected. Remove or move to docs before shipping."
  exit 1
fi

echo "✔ No UI TODO strings found."
