# Lockfile required (Store Gate 0)

This repo intentionally requires a lockfile for deterministic installs in CI and EAS builds.

Generate and commit it on your machine (internet access required):

```bash
npm install
git add package-lock.json
git commit -m "chore: add lockfile"
```

If you prefer pnpm or yarn, switch package manager and commit the corresponding lockfile.
