# Lockfile policy (Phase 1)

Phase 1 requires deterministic installs.

## What to do

1. From repo root:

```bash
rm -rf node_modules
npm install
```

2. Ensure `package-lock.json` is created.

3. Commit it:

```bash
git add package-lock.json
git commit -m "chore: add lockfile"
```

## Why

Without a lockfile, installs can drift across machines/CI, causing random breakages.
