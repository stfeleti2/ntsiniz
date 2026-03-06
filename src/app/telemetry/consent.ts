import { getSettings, upsertSettings } from '@/core/storage/settingsRepo'

let crashReportingEnabled: boolean = false
let decidedAt: number | undefined = undefined
let loaded = false

export async function initTelemetryConsent() {
  try {
    const s = await getSettings()
    crashReportingEnabled = s.telemetryCrashReportingEnabled ?? false
    decidedAt = s.telemetryCrashReportingDecidedAt
    loaded = true
  } catch {
    loaded = true
  }
}

export function isCrashReportingEnabled() {
  return crashReportingEnabled
}

export function telemetryConsentDecided() {
  return typeof decidedAt === 'number' && decidedAt > 0
}

export async function setCrashReportingEnabled(enabled: boolean) {
  crashReportingEnabled = enabled
  decidedAt = Date.now()
  try {
    const s = await getSettings()
    await upsertSettings({ ...s, telemetryCrashReportingEnabled: enabled, telemetryCrashReportingDecidedAt: decidedAt })
  } catch {
    // ignore
  }
}

export function telemetryConsentLoaded() {
  return loaded
}
