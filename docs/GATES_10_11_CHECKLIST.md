# Gates 10–11 Checklist (Core Loop Perfection)

Date: 2026-03-03

## Gate 10 — Killer-loop-only UI sweep + strict i18n enforcement
- ✅ Replace sentence literals that reach UI via variables (example: weekly challenge header/body)
  - Evidence: `src/app/screens/SessionScreen.tsx` now uses `t('challenge.weeklyTitle')`, `t('challenge.weeklyCoachTitle')`, `t('challenge.weeklyCoachBody')`
- ✅ Invite screen placeholder + share text localized
  - Evidence: `src/app/screens/InviteScreen.tsx` uses `t('invite.placeholder')` and `t('invite.shareText', ...)`
- ✅ i18n scanner tightened to catch sentence-like literals in UI surfaces + includes `placeholder`
  - Evidence: `scripts/check-i18n.mjs`

## Gate 11 — Release evidence enforcement (device matrix + store forms snapshot)
- ✅ Device matrix template added
  - Evidence: `docs/qa/DEVICE_MATRIX.md`
- ✅ Store forms snapshot template added
  - Evidence: `docs/privacy/STORE_FORMS_SNAPSHOT.md`
- ✅ CI-enforceable checks (only when `RELEASE=1`)
  - Evidence: `scripts/check-device-matrix.mjs`, `scripts/check-store-forms.mjs`, `package.json` scripts `check:device-matrix`, `check:store-forms`

## How to verify
```bash
npm install
npm run check:i18n
RELEASE=1 npm run check:device-matrix
RELEASE=1 npm run check:store-forms
npm run ci
```
