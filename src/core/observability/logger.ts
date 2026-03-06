export type CoreLogMeta = Record<string, any>

export type CoreLogger = {
  info?: (message: string, meta?: CoreLogMeta) => void
  warn: (message: string, meta?: CoreLogMeta) => void
  error: (message: string, meta?: CoreLogMeta) => void
}

export type CoreLogEntry = {
  level: 'info' | 'warn' | 'error'
  message: string
  meta?: CoreLogMeta
  atMs: number
}

// Small in-memory ring buffer for support/debug exports (offline-first).
// NOTE: stays local unless the user shares it explicitly.
const RING_MAX = 400
let ring: CoreLogEntry[] = []
function pushRing(e: CoreLogEntry) {
  ring.push(e)
  if (ring.length > RING_MAX) ring = ring.slice(ring.length - RING_MAX)
}

export function getRecentLogs(opts?: { sinceMs?: number; limit?: number }): CoreLogEntry[] {
  const since = opts?.sinceMs ?? 0
  const out = ring.filter((e) => e.atMs >= since)
  const lim = opts?.limit ?? 200
  return out.slice(Math.max(0, out.length - lim))
}

let _logger: CoreLogger = {
  info: () => {},
  warn: (message, meta) => {
    if (__DEV__) console.warn(message, meta ?? {})
  },
  error: (message, meta) => {
    if (__DEV__) console.error(message, meta ?? {})
  },
}

export function setCoreLogger(next: CoreLogger) {
  _logger = next
}

export function coreInfo(message: string, meta?: CoreLogMeta) {
  pushRing({ level: 'info', message, meta, atMs: Date.now() })
  try { _logger.info?.(message, meta) } catch {}
}

export function coreWarn(message: string, meta?: CoreLogMeta) {
  pushRing({ level: 'warn', message, meta, atMs: Date.now() })
  try { _logger.warn(message, meta) } catch {}
}

export function coreError(message: string, meta?: CoreLogMeta) {
  pushRing({ level: 'error', message, meta, atMs: Date.now() })
  try { _logger.error(message, meta) } catch {}
}

// Convenience object used by most call sites.
export const logger = {
  info: coreInfo,
  warn: coreWarn,
  error: coreError,
}
