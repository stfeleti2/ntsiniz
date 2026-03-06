# Monetization Compliance Checklist (Global)

Use this checklist before shipping any build that includes subscriptions, trials, or ads.

## Subscriptions (RevenueCat + stores)

- [ ] **Localized price display**
  - UI must never hardcode currency (no `R99`, `$9.99` strings).
  - Always display store-provided localized pricing strings from RevenueCat.
- [ ] **Restore purchases**
  - iOS + Android: "Restore" action is visible in paywall/settings.
  - Restore flow handles: success, no purchases found, network error.
- [ ] **Trial clarity**
  - Trial duration + renewal behavior are clear on the paywall.
  - Cancellation instructions are present (store-managed).

## Ads (if enabled)

- [ ] Provider SDK integrated and **tested with test IDs** on both platforms.
- [ ] Remote config can disable ads instantly.
- [ ] Frequency caps set to avoid retention harm.

## Store forms alignment

- [ ] Apple App Privacy + Google Data Safety match:
  - what is collected (and why)
  - what is shared
  - consent gates
- [ ] Truth table updated: `docs/privacy/DATA_MAP.md` + `docs/privacy/TELEMETRY_TRUTH_TABLE.md`.
