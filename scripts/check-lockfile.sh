#!/usr/bin/env bash
set -euo pipefail

if [[ -f "package-lock.json" ]]; then
  exit 0
fi

echo "🟡 package-lock.json is missing."
echo "Why it matters: deterministic installs prevent surprise regressions near launch."
echo "Current CI will use 'npm install' as a fallback until a lockfile is committed."
echo "Fix locally (recommended): run 'npm install' and commit package-lock.json, then switch CI back to 'npm ci'."
exit 0
