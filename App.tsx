import 'react-native-url-polyfill/auto'
import React, { useEffect, useState } from 'react'
import { Alert, LogBox, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'

import { t } from '@/app/i18n'
import { AppNavigator } from '@/app/navigation/AppNavigator'
import { initTelemetryGate, maybePromptForTelemetryDecision } from '@/app/telemetry/gate'
import { reportUiError } from '@/app/telemetry/report'
import { track } from '@/app/telemetry'

import { initDb } from '@/core/storage/db'
import { getSettings } from '@/core/storage/settingsRepo'
import { setLocale as setCoreLocale, setMissingKeySink } from '@/core/i18n'
import { primeRemoteFlags } from '@/core/config/flags'
import { verifyContentManifestSignature } from '@/core/content/verifyManifestSignature'
import { initQualityRuntime } from '@/core/perf/qualityRuntime'
import { initNotifications } from '@/app/notifications'
import { initCloudRuntime } from '@/core/cloud/runtime'
import { initBilling } from '@/core/billing'
import { startBillingBootstrap } from '@/core/billing/bootstrap'
import { initAudioSupervisor } from '@/core/audio/audioSupervisor'
import { setCoreLogger } from '@/core/observability/logger'

import { RootErrorBoundary } from '@/app/errors/RootErrorBoundary'
import { ThemeProvider } from '@/ui/theme'
import { DevModulesProvider } from '@/ui/modules'
import { SnackbarProvider } from '@/ui/components/kit/Snackbar'
import { DevPerfOverlay } from '@/app/components/DevPerfOverlay'

if (__DEV__) {
  // Expo SDK 54 still emits this from expo-av at runtime.
  LogBox.ignoreLogs(['[expo-av]: Expo AV has been deprecated'])
}

export default function App() {
  const [booted, setBooted] = useState(false)
  const [showPerf, setShowPerf] = useState(false)

  // Audio supervisor: always on, always cleaned up.
  useEffect(() => {
    const stop = initAudioSupervisor()
    return () => {
      try {
        stop()
      } catch {}
    }
  }, [])

  // Boot sequence: initialize core systems deterministically.
  useEffect(() => {
    let stopBilling: null | (() => void) = null
    let step = 'bootstrap'

    ;(async () => {
      step = 'initTelemetryGate'
      // Telemetry is consent-gated and env-gated inside the telemetry gate.
      await initTelemetryGate().catch(() => {})

      // i18n missing-key tracking (non-PII). Keep it low-volume.
      const seen = new Set<string>()
      setMissingKeySink((info) => {
        const k = `${info.locale}:${info.key}`
        if (seen.has(k)) return
        if (seen.size > 60) return
        seen.add(k)
        track('i18n_missing_key', { key: info.key, locale: info.locale })
      })

      // Core logger forwards to telemetry (safe, consent-gated inside captureException).
      setCoreLogger({
        warn: (message, meta) => reportUiError(new Error(message), { ...meta, level: 'warn', src: 'core' }),
        error: (message, meta) => reportUiError(new Error(message), { ...meta, level: 'error', src: 'core' }),
      })

      step = 'initDb'
      await initDb()
      step = 'getSettings'
      const settings = await getSettings().catch(() => null)
      if (settings?.language) setCoreLocale(settings.language)

      try {
        step = 'primeRemoteFlags'
        await primeRemoteFlags()
      } catch (e) {
        // Don't block startup; but make this observable.
        reportUiError(e, { src: 'primeRemoteFlags' })
      }

      // Content integrity: verify manifest signature early so loaders can enforce it.
      step = 'verifyContentManifestSignature'
      await verifyContentManifestSignature().catch(() => {})

      // Performance strategy: choose AUTO/HIGH/BALANCED/LITE once settings + device info are available.
      step = 'initQualityRuntime'
      initQualityRuntime()

      step = 'initBilling'
      await initBilling()
      step = 'startBillingBootstrap'
      stopBilling = startBillingBootstrap()

      step = 'initNotifications'
      await initNotifications()
      step = 'initCloudRuntime'
      await initCloudRuntime()

      // Dev-only perf overlay toggle.
      if (__DEV__) {
        setShowPerf(!!settings?.devPerfOverlayEnabled)
      }

      setBooted(true)

      // Ask once about crash reporting (trust-by-default: OFF until user opts in).
      setTimeout(() => {
        maybePromptForTelemetryDecision(() =>
          new Promise((resolve) => {
            Alert.alert(
              t('telemetry.prompt.title'),
              t('telemetry.prompt.body'),
              [
                { text: t('telemetry.prompt.notNow'), style: 'cancel', onPress: () => resolve('later') },
                { text: t('telemetry.prompt.no'), style: 'destructive', onPress: () => resolve('no') },
                { text: t('telemetry.prompt.yes'), onPress: () => resolve('yes') },
              ],
            )
          }),
        ).catch(() => {})
      }, 800)
    })().catch((e) => reportUiError(e, { src: 'app_init_failed', step }))

    return () => {
      try {
        stopBilling?.()
      } catch {}
    }
  }, [])

  if (!booted) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>{t('common.loading') ?? 'Loading…'}</Text>
      </View>
    )
  }

  return (
    <RootErrorBoundary>
      <DevModulesProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <StatusBar style="light" />
            <AppNavigator />
            {showPerf ? <DevPerfOverlay /> : null}
          </SnackbarProvider>
        </ThemeProvider>
      </DevModulesProvider>
    </RootErrorBoundary>
  )
}
