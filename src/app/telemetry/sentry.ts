import { Platform } from 'react-native'
import Constants from 'expo-constants'
import * as Sentry from '@sentry/react-native'
import { getTelemetryEvents } from './buffer'
import { isCrashReportingEnabled } from './consent'

export type SentryBootstrapResult = {
  enabled: boolean
}

function getExtra(): Record<string, any> {
  // expo-constants changed shapes across workflows; try a few.
  const cfg: any = (Constants as any).expoConfig ?? (Constants as any).manifest ?? (Constants as any).manifest2
  return (cfg?.extra ?? {}) as Record<string, any>
}

export function initSentry(): SentryBootstrapResult {
  const extra = getExtra()
  const dsn = String(extra.sentryDsn ?? '')
  const enableInDev = Boolean(extra.sentryEnableInDev)
  const enabled = Boolean(dsn) && (enableInDev ? true : !__DEV__)

  if (!enabled) return { enabled: false }

  const tracesSampleRate = typeof extra.sentryTracesSampleRate === 'number' ? extra.sentryTracesSampleRate : 0

  Sentry.init({
    dsn,
    enabled: true,
    environment: String(extra.sentryEnv ?? (__DEV__ ? 'dev' : 'prod')),
    tracesSampleRate,
    attachStacktrace: true,
    maxBreadcrumbs: 80,
    beforeSend(event) {
      if (!isCrashReportingEnabled()) return null
      // Attach our lightweight in-memory breadcrumbs (kept small and safe).
      const breadcrumbs = (event.breadcrumbs ?? []).slice(0)
      for (const b of getTelemetryEvents()) {
        breadcrumbs.push({
          category: 'telemetry',
          message: b.name,
          data: b.props,
          timestamp: b.ts / 1000,
          level: 'info',
        } as any)
      }
      event.breadcrumbs = breadcrumbs.slice(-80)
      return event
    },
  })

  // Base tags (cheap + useful)
  Sentry.setTag('platform', Platform.OS)
  Sentry.setTag('appVersion', String((Constants as any)?.expoConfig?.version ?? ''))

  return { enabled: true }
}

export function captureException(err: unknown, extras?: Record<string, any>) {
  try {
    if (!isCrashReportingEnabled()) return
    if (extras && Object.keys(extras).length > 0) {
      Sentry.withScope((scope) => {
        scope.setExtras(extras)
        Sentry.captureException(err)
      })
      return
    }
    Sentry.captureException(err)
  } catch {
    // ignore
  }
}

export function captureMessage(message: string, extras?: Record<string, any>) {
  try {
    if (extras && Object.keys(extras).length > 0) {
      Sentry.withScope((scope) => {
        scope.setExtras(extras)
        Sentry.captureMessage(message)
      })
      return
    }
    Sentry.captureMessage(message)
  } catch {
    // ignore
  }
}
