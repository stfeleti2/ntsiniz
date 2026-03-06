# Telemetry Truth Table

This doc is the **contract** between:
- App code (`src/app/telemetry/*`)
- Store forms (Apple App Privacy / Google Data Safety)
- Privacy copy (`docs/PRIVACY_COPY.md`)

## Rules

1. **No crash reporting before consent**.
2. Telemetry events are **non-sensitive** and **minimal**.
3. Practice audio is **never uploaded** (unless you add a future explicit feature + consent).

## Data flows

| System | When | Data | Where in code |
|---|---|---|---|
| Local breadcrumbs | Always | recent event names + small props | `src/app/telemetry/buffer.ts` |
| Sentry crash reporting | Only after consent | error stack + breadcrumbs | `src/app/telemetry/consent.ts`, `src/app/telemetry/sentry.ts` |
| RevenueCat | When billing is used | anonymous purchase/entitlement state | `src/app/billing/*` |
| Supabase (optional) | Only if enabled | auth + cloud sync records | `src/core/cloud/*` |

## Store form checklist

- Apple: **Data Not Collected** except (if enabled) “Diagnostics” for crash reporting.
- Google: mark “Crash reports” only if consented crash reporting is offered.

**If you change any telemetry**:
1) update `docs/privacy/TELEMETRY_EVENTS.md`
2) update `docs/privacy/DATA_MAP.md`
3) update store forms
