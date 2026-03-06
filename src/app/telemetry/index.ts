import { Platform } from 'react-native'
import { pushTelemetryEvent, getTelemetryEvents, resetTelemetryEvents } from './buffer'
import { captureException } from './sentry'
import { isCrashReportingEnabled } from './consent'
import type { TelemetryEventName, TelemetryEventProps } from './events'

export function track<T extends TelemetryEventName>(name: T, props?: TelemetryEventProps[T]) {
  pushTelemetryEvent(name, props)

  if (__DEV__) {
    // Keep it short; props can be huge.
    console.log('[telemetry]', name, props ? safeProps(props) : '')
  }
}

export function getBreadcrumbs() {
  return getTelemetryEvents()
}

export function resetBreadcrumbs() {
  resetTelemetryEvents()
}

/**
 * Crash-proofing: capture unhandled errors and track lightweight breadcrumbs.
 * If Sentry is enabled (see initSentry), we also forward crashes to Sentry.
 */
export function initTelemetry() {
  try {
    const ErrorUtils = (globalThis as any).ErrorUtils
    if (ErrorUtils?.getGlobalHandler && ErrorUtils?.setGlobalHandler) {
      const prev = ErrorUtils.getGlobalHandler()
      ErrorUtils.setGlobalHandler((err: any, isFatal?: boolean) => {
        track('app_error', {
          message: String(err?.message ?? err),
          errorName: String(err?.name ?? 'Error'),
          fatal: !!isFatal,
          platform: Platform.OS,
        })

        // Respect user consent: avoid sending crash reports when disabled.
        if (isCrashReportingEnabled()) captureException(err, { fatal: !!isFatal, platform: Platform.OS })

        prev?.(err, isFatal)
      })
    }
  } catch {
    // ignore
  }
}

function safeProps(props: Record<string, any>) {
  const out: Record<string, any> = {}
  for (const k of Object.keys(props)) {
    const v = props[k]
    out[k] = typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? v : '[obj]'
  }
  return out
}
