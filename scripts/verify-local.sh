#!/usr/bin/env bash
set -euo pipefail

echo "== Local verification =="

if [[ ! -f package-lock.json ]]; then
  echo "⛔ package-lock.json missing. Run 'npm install' and commit the lockfile." >&2
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "⛔ node_modules missing. Run 'npm ci' first." >&2
  exit 1
fi

echo "Running: lint / typecheck / tests / e2e smoke (if configured)"
npm run lint
npm run typecheck
npm test

if command -v maestro >/dev/null 2>&1; then
  npm run e2e:maestro
else
  echo "🟡 maestro not installed locally; skipping e2e. Install maestro to run: npm run e2e:maestro"
fi

echo "✔ Local verification complete"
