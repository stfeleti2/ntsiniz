# Store forms guide (Apple App Privacy + Google Data Safety)

Use `docs/privacy/DATA_MAP.md` as your single source of truth.

## Apple App Privacy
- Declare:
  - Data collected by you (app)
  - Data collected by third-party SDKs you include
- Ensure “tracking” is only marked if you track users across apps/websites.

## Google Play Data Safety
- Declare:
  - Data collected
  - Data shared
  - Data processed ephemerally
  - Security practices (encryption in transit, deletion request support if applicable)

## Verification checklist
- If Sentry is enabled: confirm crash reporting toggle exists and is described in Privacy/Terms.
- If Supabase auth exists: declare account identifiers.
- If RevenueCat exists: declare purchases and identifiers as required.


## Checklist (Apple App Privacy + Google Data Safety)

1. Confirm **Sentry is disabled until consent**: `src/app/telemetry/consent.ts`, `src/app/telemetry/gate.ts`
2. Confirm **what we collect** matches `docs/privacy/DATA_MAP.md`
3. Confirm **event names** match `docs/privacy/TELEMETRY_EVENTS.md`
4. If you change telemetry, update **both** docs and rerun `npm run quality:gate`

### App Privacy / Data Safety mapping (source of truth)

- **Crash / diagnostics**: Sentry (only after consent)
- **Analytics**: *local ring buffer* for breadcrumbs (not exported unless crash reporting enabled)
- **Purchases**: RevenueCat (purchase status + entitlement)
- **Account / cloud (optional)**: Supabase (user auth + cloud sync)

If a store form asks “data linked to user”, use `DATA_MAP.md` tables as the single mapping.
