import { initTelemetry } from './index'
import { initTelemetryConsent, telemetryConsentLoaded, isCrashReportingEnabled, telemetryConsentDecided, setCrashReportingEnabled } from './consent'
import { initSentry } from './sentry'
import { audit } from '@/core/trust/audit'

/**
 * Single entry-point for telemetry.
 *
 * Principles:
 * - Trust by default: user controls crash reporting.
 * - Secure-by-design: avoid initializing crash reporting before consent is loaded.
 * - Keep the rest of the app free of scattered `if (dsn)` / `if (consent)` checks.
 */
export async function initTelemetryGate() {
  // Load consent first (fast, local).
  await initTelemetryConsent().catch(() => {})

  // Always keep lightweight in-memory breadcrumbs (local-only).
  initTelemetry()

  if (!telemetryConsentLoaded()) return { sentryEnabled: false }
  if (!isCrashReportingEnabled()) return { sentryEnabled: false }

  const sentry = initSentry()
  return { sentryEnabled: sentry.enabled }
}

/**
 * If the user has never made a telemetry choice, we keep crash reporting OFF
 * and ask once (non-blocking) after the app is interactive.
 */
export async function maybePromptForTelemetryDecision(prompt: () => Promise<'yes' | 'no' | 'later'>) {
  if (!telemetryConsentLoaded()) return
  if (telemetryConsentDecided()) return

  const res = await prompt().catch(() => 'later' as const)
  if (res === 'later') return
  await setCrashReportingEnabled(res === 'yes')

  await audit({ kind: 'telemetry.consent', payload: { enabled: res === 'yes' } }).catch(() => {})

  // If they opted in and DSN exists, bootstrap Sentry now.
  if (res === 'yes') {
    try {
      initSentry()
    } catch {
      // ignore
    }
  }
}
