#!/usr/bin/env bash
set -euo pipefail

if [ ! -f package-lock.json ]; then
  echo "ERROR: package-lock.json is required for releases (deterministic installs)."
  echo "Fix on your machine:"
  echo "  npm install"
  echo "  git add package-lock.json"
  echo "  git commit -m 'chore: add lockfile'"
  exit 1
fi

echo "OK: package-lock.json present."
