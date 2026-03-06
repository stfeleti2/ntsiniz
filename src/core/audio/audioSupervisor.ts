import { initInterruptions, onInterruption, type InterruptionEvent } from './interruptions'
import { startAudioRouteSupervisor } from './routeSupervisor'
import { routeBroker } from './routeBroker'
import { logger } from '@/core/observability/logger'

export type AudioSupervisorSnapshot = {
  startedAtMs: number
  routeChangeCount: number
  interruptionCount: number
  audioSessionErrorCount: number
  lastInterruption?: InterruptionEvent | null
}

let startedAtMs = 0
let routeChangeCount = 0
let interruptionCount = 0
let audioSessionErrorCount = 0

let started = false
let unsubs: Array<() => void> = []
let lastInterruption: InterruptionEvent | null = null

function routeFingerprint(routeType: string, inputName?: string, outputName?: string) {
  return `${routeType}|${inputName ?? ''}|${outputName ?? ''}`
}

/**
 * Single bootstrap for "audio correctness" lifecycle.
 * It unifies:
 * - route broker start
 * - interruption events
 * - probe cache invalidation on route changes
 */
export function initAudioSupervisor(): () => void {
  if (started) return () => {}
  started = true
  startedAtMs = Date.now()
  // Fresh counters per lifecycle.
  routeChangeCount = 0
  interruptionCount = 0
  audioSessionErrorCount = 0
  lastInterruption = null

  const stopInterruptions = initInterruptions()
  unsubs.push(stopInterruptions)
  // Keep a central route supervisor running.
  const stopRouteSupervisor = startAudioRouteSupervisor()
  unsubs.push(stopRouteSupervisor)

  // Count route changes (subscribe is cheap and already centralized).
  let prevRouteFp: string | null = null
  unsubs.push(
    routeBroker.subscribe((s) => {
      if (!s.route) return
      const fp = routeFingerprint(s.route.routeType, s.route.inputName, (s.route as any).outputName)
      if (!prevRouteFp) {
        prevRouteFp = fp
        return
      }
      if (fp === prevRouteFp) return
      prevRouteFp = fp
      routeChangeCount += 1
    }),
  )

  // Count interruptions and audio session errors.
  unsubs.push(
    onInterruption((e) => {
      lastInterruption = e
      if (e.type === 'audio_session_error') audioSessionErrorCount += 1
      interruptionCount += 1
    }),
  )

  logger.info('audioSupervisor inited')
  return () => stopAudioSupervisor()
}

export function stopAudioSupervisor() {
  if (!started) return
  for (const u of unsubs) {
    try {
      u()
    } catch (e) {
      logger.warn('audioSupervisor unsubscribe failed', { error: e })
    }
  }
  unsubs = []
  started = false
  // Avoid stale values after hot reload / remount.
  startedAtMs = 0
  routeChangeCount = 0
  interruptionCount = 0
  audioSessionErrorCount = 0
  lastInterruption = null
}

export function getAudioSupervisorSnapshot(): AudioSupervisorSnapshot {
  return {
    startedAtMs,
    routeChangeCount,
    interruptionCount,
    audioSessionErrorCount,
    lastInterruption,
  }
}
