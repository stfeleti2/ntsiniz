import { AppState, type AppStateStatus } from 'react-native'
import { routeBroker } from './routeBroker'
import { logger } from '@/core/observability/logger'

export type InterruptionEvent =
  | { type: 'app_state'; from: AppStateStatus; to: AppStateStatus; atMs: number }
  | { type: 'audio_session_error'; message: string; atMs: number }
  | { type: 'audio_route'; routeType: string; inputName?: string; atMs: number }

type Handler = (e: InterruptionEvent) => void

let inited = false
const handlers = new Set<Handler>()
let lastEvent: InterruptionEvent | null = null

let cleanupInterruptions: (() => void) | null = null

function routeFingerprint(routeType: string, inputName?: string) {
  return `${routeType}|${inputName ?? ''}`
}

export function initInterruptions(): () => void {
  if (inited) return cleanupInterruptions ?? (() => {})
  inited = true

  const unsubs: Array<() => void> = []

  let last: AppStateStatus = AppState.currentState
  const appSub = AppState.addEventListener('change', (next) => {
    const e: InterruptionEvent = { type: 'app_state', from: last, to: next, atMs: Date.now() }
    last = next
    lastEvent = e
    for (const h of handlers) h(e)
  })

  unsubs.push(() => {
    try {
      appSub.remove()
    } catch {
      // ignore
    }
  })

  // Ensure broker is started (prime is async-safe; we treat the first non-null state as baseline).
  routeBroker.start().catch((e) => logger.warn('routeBroker start failed', e))

  let prevFingerprint: string | null = null
  const unsubRoute = routeBroker.subscribe((s) => {
    if (!s.route) return
    const fp = routeFingerprint(s.route.routeType, s.route.inputName)
    // Baseline on first route snapshot.
    if (!prevFingerprint) {
      prevFingerprint = fp
      return
    }
    if (fp === prevFingerprint) return
    prevFingerprint = fp
    const e: InterruptionEvent = {
      type: 'audio_route',
      routeType: s.route.routeType,
      inputName: s.route.inputName,
      atMs: Date.now(),
    }
    lastEvent = e
    for (const h of handlers) h(e)
  })

  unsubs.push(unsubRoute)

  cleanupInterruptions = () => {
    for (const u of unsubs) u()
    cleanupInterruptions = null
    inited = false
  }

  return cleanupInterruptions
}

export function onInterruption(handler: Handler) {
  handlers.add(handler)
  return () => {
    handlers.delete(handler)
  }
}

export function getLastInterruption(): InterruptionEvent | null {
  return lastEvent
}

/** Called by AudioSessionManager when setting audio mode fails. */
export function notifyAudioSessionError(message: string) {
  const e: InterruptionEvent = { type: 'audio_session_error', message, atMs: Date.now() }
  lastEvent = e
  for (const h of handlers) h(e)
}
