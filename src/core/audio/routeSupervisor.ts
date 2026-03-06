import { routeBroker } from './routeBroker'
import { invalidateAudioInputFormatCache, probeAudioInputFormat } from './audioFormatProbe'
import { logger } from '@/core/observability/logger'

let started = false

/**
 * Central supervisor to keep audio probes/policies consistent across the app.
 * - Invalidate probe cache on route changes (e.g. Bluetooth connect/disconnect)
 * - Best-effort re-probe so screens can rely on fresh values.
 */
export function startAudioRouteSupervisor() {
  if (started) return () => {}
  started = true

  let prevFp: string | null = null
  const unsub = routeBroker.subscribe((s) => {
    if (!s.route) return
    const fp = `${s.route.routeType}|${s.route.inputName ?? ''}|${(s.route as any).outputName ?? ''}`
    if (!prevFp) {
      prevFp = fp
      return
    }
    if (fp === prevFp) return
    prevFp = fp
    invalidateAudioInputFormatCache()
    // Best-effort refresh (do not block UI).
    probeAudioInputFormat().catch((err) => logger.warn('audio format re-probe failed', err))
  })

  return () => {
    try {
      unsub()
    } finally {
      started = false
    }
  }
}
