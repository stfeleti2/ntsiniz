# Sentry Setup (Crash Reporting)

Ntsiniz ships with Sentry wiring **built-in**. If you do nothing, Sentry stays **disabled**.

## 1) Create a Sentry project

Create a new Sentry project for **React Native** and copy the **DSN**.

## 2) Set environment variables

### Local dev / local builds

Add these to your shell (or your CI), then start/build:

- `SENTRY_DSN` (required to enable Sentry)
- `SENTRY_ENV` (optional, e.g. `production` / `staging`)
- `SENTRY_TRACES_SAMPLE_RATE` (optional, default `0`)
- `SENTRY_ENABLE_IN_DEV` (optional; set to `true` if you want Sentry in development)

Example:

```bash
export SENTRY_DSN="https://<key>@o0.ingest.sentry.io/<project>"
export SENTRY_ENV="staging"
export SENTRY_TRACES_SAMPLE_RATE="0.05"
```

### EAS Build

Set `SENTRY_DSN` (and optionally the others) in your EAS environment/secrets.

## 3) Verify it works

Create a release build, then deliberately crash from a temporary button:

```ts
throw new Error('Hello, Sentry!')
```

Confirm you can see the event in Sentry.

## Notes

- Route changes are tagged as `route` in Sentry.
- Lightweight in-memory breadcrumbs (last ~60 events) are attached to each event.
