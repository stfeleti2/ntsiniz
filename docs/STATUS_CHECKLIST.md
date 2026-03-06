# Ntsiniz Status Checklist

Last updated: 2026-03-04

Legend: ✅ done · 🟡 polish needed · ⛔ missing

## Phase 1 — Core practice MVP

- ✅ Mic level meter + clipping warnings (recording UX)

- ✅ Drill sessions (run + record)
- ✅ Best take saving
- ✅ Playback (waveform + progress)
- ✅ Explainable grading module (phrase label + reason + cue)
- ✅ "What now?" micro-fix suggestions
- ✅ Ghost Guide overlay (Aurora) in Drills
  - ✅ Sustain fill
  - ✅ Streak aura

## Phase 2 — Social foundation

- ✅ Community tabs (Journey / Challenge / Discover / Following)
- ✅ Feed engine + post stats
- ✅ Post detail (comments + report)
- ✅ Mod report entry points (post/comment/clip)

## Phase 3 — Competition killer layer

- ✅ Duets (pack create/import/session)
- ✅ Competitions (hub/detail/submit/leaderboard)
- ✅ Marketplace (programs/coaches)
- ✅ Offline coach workflow (feedback pack export/import)
- ✅ Mod tools (reports + audit log + actions)

## Phase 4 — Ship + grow + earn

- ✅ Retention (daily missions + weekly goals)
- ✅ Monetization rails (entitlements + gating)
- ✅ RevenueCat integration (real IAP)
- ✅ Permissions primer (mic/camera)
- ✅ Privacy screen + legal docs in repo
- ✅ Store polish (icons/splash/adaptive + permission tightening + iOS privacy manifest)

## Phase 5 — Linkability + visibility

- ✅ Deep links foundation (invite link)
- ✅ Sync visibility screen (queue debugging UX)
- ✅ Creator profile screen
- ✅ Share cards (premium share payload)

## Phase 6 — MVP → Production Product (this repo)

### Repo hardening
- ✅ Public links config (`publicAppUrl`, `publicInviteUrlBase`)
- ✅ Removed UI placeholder TODO strings
- ✅ Added quality gates (`npm run quality:gate`)

### Still to complete before public launch
- ✅ Translate `zu` + `xh` for all critical UI surfaces (fallback to English remains for non-critical keys)
- ✅ Legal docs filled (provider + age policy in-app and in docs)
- ✅ No-ads / no-analytics posture added and reflected in Privacy Policy
- 🟡 Add backend (optional) for mutual invites + account recovery (only if you want that level of social)


## Gates 1–9 — Core-loop hardening

- ✅ Implemented and documented: see `docs/GATES_1_9_CHECKLIST.md`

## Gates 10–11 — UI i18n sweep + Release evidence enforcement

- ✅ Implemented and documented: see `docs/GATES_10_11_CHECKLIST.md`
- ✅ Pro Training Regiment v1 (8-week curriculum + lessons pack) added (`src/content/curriculum/pro_regimen.*.json`, `src/content/lessons/pro_regimen.*.json`)
- ✅ Pro Training Regiment v2 (12-week + 3 tracks) added (`src/content/curriculum/pro_regimen12_*.*.json`, `src/content/lessons/pro_regimen12_*.*.json`)
- ✅ Track-specific coaching policy wired (track/week progression + lesson base plan)
- ✅ Advanced track overlay reduction + transfer independence (OFF_POST only on transfer drills weeks 9–12)


## Gate 2 + Gate 3 — Route handling + capture quality

- ✅ Audio route detection (iOS/Android) via native module (built-in/headset/Bluetooth)
- ✅ Route-change broker wired (App init + interruptions stream)
- ✅ Input selection UX (DrillScreen picker + Settings preferences)
- ✅ Capture session configuration for vocal capture (mode/category/focus)
