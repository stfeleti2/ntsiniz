# Data map (privacy/telemetry truth)

This document is the **source of truth** for App Store “App Privacy” and Google Play “Data Safety”.

Principles:
- **Audio stays on-device.** We never upload raw mic audio.
- **Trust by default:** crash reporting is **OFF until the user opts in**.
- **Minimal collection:** only what is required for diagnostics / billing / optional cloud features.

## Systems

### 1) Sentry (crash reporting)
- **When active:** Only if `sentryDsn` is configured.
- **User control:** Settings → Telemetry → Crash reporting (on/off). Default is **off until opted in**.
- **Data never sent:** raw audio, recorded clips, user-entered freeform text.
- **Data types (typical):** crash stack traces, device/app version, OS version, breadcrumbs (lightweight).
- **Purpose:** diagnostics / crash fixing.

### 2) RevenueCat (subscriptions)
- **When active:** Always, if Pro purchases are enabled.
- **Data types:** purchase receipts, entitlement state, anonymous app user id (or custom user id if you set one).
- **Purpose:** payments + entitlement verification.

### 3) Supabase (cloud sync / accounts)
- **When active:** only if you enable sign-in / cloud features in the build surface.
- **Data types:** email/identity (if auth), sync payloads you choose to upload.
- **Purpose:** account + sync.

## Disclosure table (use this for store forms)

| System | Data collected | Shared with third parties? | Purpose | Optional? | User controls |
|---|---|---|---|---|---|
| Sentry | Crash stack traces; app version; OS version; device model; session/breadcrumb events (names + small key/value props). IP address may be processed by Sentry as part of normal delivery. | Yes (Sentry as a processor) | Diagnostics / crash fixing | Yes (requires DSN + opt-in) | Settings toggle (default OFF until opt-in) |
| RevenueCat | Purchase receipts; entitlement state; anonymous RevenueCat app user id; device/app metadata required for receipt validation. | Yes (RevenueCat as a processor) | Payments + entitlement verification | Required for Pro billing (if Pro is enabled) | OS purchase controls + “Restore purchases” |
| Supabase | Account identifiers (email, user id) if auth enabled; optional synced settings/profile/progress if you implement sync. | Yes (Supabase as a processor) | Optional account + sync | Optional (cloud features) | Account controls (sign-in/out) + sync toggles |

## Rules
- Do not claim “Data not collected” if any system collects identifiers in production.
- If Store Build disables a feature (e.g., camera/media permissions), your store forms must reflect the shipped build.

## Verification checklist (engineer-facing)
- With telemetry opt-in **OFF**: Sentry is not initialized and no crash events are sent.
- With telemetry opt-in **ON** and DSN present: Sentry initializes and can capture a test crash.
- RevenueCat is initialized only when Pro/billing surface is enabled.
- Supabase network calls only occur when cloud/auth is enabled.


---

## Appendix: Event list

See `docs/privacy/TELEMETRY_EVENTS.md` for the canonical, code-linked list of telemetry events.
