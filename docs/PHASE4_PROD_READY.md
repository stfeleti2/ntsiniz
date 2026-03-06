# Phase 4 — Production Readiness (Ntsiniz)

This repo now includes **real billing rails** using **RevenueCat** + a safe fallback when keys are missing.

## 1) RevenueCat (real purchases)

### Install (already added to package.json)
- `react-native-purchases` (RevenueCat SDK)
- `expo-dev-client` (needed to test native purchases in a dev build)

RevenueCat + Expo guidance:
- Expo in-app purchases guide. 
- RevenueCat Expo installation guide. 

> In **Expo Go**, RevenueCat runs in preview/mock mode so the app loads, but **real purchases require a Dev Build or Store build**.

### Configure keys (EAS secrets recommended)
Set these environment variables:
- `REVENUECAT_IOS_API_KEY`
- `REVENUECAT_ANDROID_API_KEY`
- Optional: `REVENUECAT_ENTITLEMENT_PRO` (default: `pro`)

They are read from `app.config.ts` into `Constants.expoConfig.extra`.

### App behavior
- If keys are present (native platforms), Billing screen shows **real offerings** and enables purchase/restore.
- If keys are missing, Billing screen shows a **Dev/Demo Pro toggle** (local gating).

## 2) Sentry (prod crash reporting)
Sentry is initialized via `src/app/telemetry/sentry.ts`.

Optional: enable native init + source map upload in EAS builds by setting:
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_DSN`

When `SENTRY_AUTH_TOKEN` exists, `app.config.ts` automatically enables the Expo Sentry plugin.

Sentry docs:
- Expo Sentry guide: https://docs.expo.dev/guides/using-sentry/
- Sentry Expo manual setup: https://docs.sentry.io/platforms/react-native/manual-setup/expo/

## 3) Recommended build flow
1. `npm i`
2. `npx expo install --fix`
3. `npx expo-doctor`
4. Create dev build:
   - `eas build --profile development --platform ios`
   - `eas build --profile development --platform android`

## 4) Store readiness checklist (minimum)
- App icons / splash / screenshots
- Privacy text (microphone/camera)
- Subscription products created in App Store Connect + Play Console
- RevenueCat offerings configured and entitlement `pro` mapped
