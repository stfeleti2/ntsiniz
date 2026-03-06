#!/usr/bin/env bash
set -euo pipefail

echo "== Quality Gate =="

bash scripts/check-lockfile.sh

npm run -s typecheck
npm run -s test
bash scripts/check-privacy-docs.sh
bash scripts/check-legal-docs.sh
npm run -s check:i18n
node scripts/check-boundaries.mjs
npm run -s perf:budget
bash scripts/check-no-ui-todos.sh

echo "✔ Quality gate passed"
