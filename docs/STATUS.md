# Ntsiniz Status Board

_Last updated: 2026-02-24_

## Phase 1 (Competition Killer Coach) — Status

**Overall:** ✅ Phase 1 feature scope is implemented and shippable as an audio-first vocal coach.

**Remaining blockers / TODOs:**

1) **Lockfile** — generate + commit `package-lock.json` on your machine (see `docs/LOCKFILE.md`).
2) **Sentry DSN** — optional, but recommended for production crash visibility (see `docs/SENTRY_SETUP.md`).

---

## Phase 1.5 (Beat-Sing-Sharp Layer) — Status

**Overall:** ✅ Added the product layer that makes Phase 1 feel like a complete coach (offline-first).

### Curriculum
- ✅ 14-day structure: Week 1 “Pitch Lock”, Week 2 “Stability”
- ✅ Home shows “Today’s plan” with a single clear CTA
- ✅ Completing a curriculum session advances the next day (only once per calendar day)

### Expanded drill packs (volume + variety)
- ✅ Warmups (hum/match/sustain/slide)
- ✅ Agility runs (pentatonic + arpeggio bounces)
- ✅ Breath phrasing (longer holds)
- ✅ Vibrato control (straight tone stability)
- ✅ Resonance awareness (forward tone cues)
- ✅ Song-adjacent phrases (simple melodies with tonic “bed” playback)

### Technique coaching UX
- ✅ Micro-lessons shown before curriculum/challenge sessions
- ✅ “Play demo” tone sequence for each micro-lesson
- ✅ Drill Results includes “Why you missed” explanations derived from metrics

### Retention hooks (Phase 2 bridge)
- ✅ Daily Challenge (offline, deterministic rotation) + best-of-day tracking
- ✅ Streak Shield (one save per 7 days) — keeps streak display from breaking
- ✅ Offline reminders (in-app nudge when you open the app after your chosen time)

## Modules

### Foundations / Infra
- ✅ CI + checks (`lint`, `typecheck`, i18n scan, tests, perf budget)
- ✅ Release + QA docs
- ✅ Feature flag-ish dev module toggles
- ✅ DB initialization (SQLite)
- ✅ Telemetry breadcrumbs + global error handler
- ✅ Sentry runtime integration (disabled until DSN is provided)

### Audio (Mic capture + recording)
- ✅ Mic permission gating
- ✅ Real-time PCM stream (`expo-stream-audio`)
- ✅ Frame buffering + backpressure protection
- ✅ WAV recording during drills + best-take saving

### Pitch Engine
- ✅ YIN pitch detection
- ✅ Hz → note/cents conversion
- ✅ VAD / confidence gating
- ✅ Smoothing: median window + hysteresis + spike rejection

### Tuner UI
- ✅ Stable tuner gauge
- ✅ In-tune zone feedback + stability meter
- ✅ Calibration screen

### Drills Engine
- ✅ JSON drill pack schema + validation
- ✅ Runner state machine (start → active → end → results)
- ✅ Multiple drill types without custom screens

### Drills Content (Phase 1 set)
- ✅ Match Note
- ✅ Sustain
- ✅ Slide Finder
- ✅ Interval Steps
- ✅ Melody Echo

### Scoring + Anti-frustration
- ✅ Normalized scoring (0–100)
- ✅ Help-mode / widening windows after repeated fails
- ✅ Confidence penalties (guessing/unvoiced)

### Voice Profile + Adaptive Loop
- ✅ Bias (sharp/flat)
- ✅ Drift slope
- ✅ Overshoot frequency
- ✅ Instability variance
- ✅ Voiced ratio
- ✅ Next-drill selection rules
- ✅ Personalized tip generator

### Progress / Journey / Proof
- ✅ Baseline capture
- ✅ Timeline entries linked to attempts
- ✅ Baseline vs latest comparisons
- ✅ Shareable progress cards (image export)

### Playback
- ✅ Playback screen
- ✅ Waveform peaks extraction + rendering
- ✅ Tap-to-seek + progress sync

### UI System
- ✅ Theme + tokens + primitives
- ✅ Kit components (Snackbars, buttons, etc.)
- ✅ Patterns for overlays/HUD
- ✅ Dev Component Lab (hidden entry)

### i18n / Global scaffolding
- ✅ `t()` conversion + i18n guard script
- ✅ Locale scaffolding (en + xh + zu)
- ✅ Drill pack loader selects locale pack with fallback
- ⚠️ Non-English packs are currently **copies** of EN (structure is ready; translation not yet done)

### Release Hardening
- ✅ Device QA checklist
- ✅ Performance budget + CI check
- ✅ Store + privacy copy

---

## Phase 2 (Viral Engine + Lightweight Social) — Status

🟡 **Partially implemented** (offline-first).

### EPIC 11 — Performance mode (video export)
- ✅ Implemented (offline-first)
  - Vertical camera + mic recording (MP4)
  - Live pitch gauge + live score during recording
  - Share video + save to gallery
  - Share cover image (thumbnail + watermark + score) for Stories
  - Post to Community (offline-first post referencing local clip)
  - Note: UI overlays are not “burned in” to MP4 in managed Expo; cover image provides watermark+score.

### EPIC 12 — Challenges + leaderboards
- ✅ Weekly challenges (deterministic rotation, offline)
- ✅ Leaderboards (You + Friends)
- ✅ Invite/share via **deep link** + **share code** (`ntsiniz://import?code=...`)
- ⚠️ Global leaderboard is **UI-only placeholder** (requires optional cloud sync later)

### EPIC 13 — Social-lite + safety
- ✅ Community tab (offline feed)
- ✅ Create post + share/import post codes
- ✅ Reactions + comments (offline)
- ✅ Safety: block user + hide post + basic profanity guardrails (offline)


### EPIC 13.5 — Accounts + Cloud Sync (Minimal)
- ✅ Optional Supabase adapter (disabled unless keys exist)
- ✅ Email OTP sign-in (in-app code entry)
- ✅ Identity migration: self ID becomes cloud user ID
- ✅ Sync queue (push local changes, pull remote updates)
- ✅ Auto-sync on app foreground (throttled)
- 📄 Setup guide: `docs/CLOUD_SYNC_SUPABASE.md`

### EPIC 15 — Feeds + Discovery (Start)
- ✅ Following graph (follow/unfollow)
- ✅ Community feed tabs: Discover / Following
- ✅ “Why you’re seeing this” hints (rules-based)

### EPIC 14 — Duets + Collabs (Async, offline-first)
- ✅ Duets hub + session UI
- ✅ Create invite: record Part A (WAV) + share `.ntsduet` pack
- ✅ Import invite: pick `.ntsduet` file + persist Part A
- ✅ Record Part B (WAV) with Part A as guide (headphone prompt)
- ✅ On-device WAV mixing (PCM16 mono) + share mix
- ✅ Post duet to Community (local post; remote devices will see the card but may not have the audio unless you add storage sync later)
