/**
 * Tiny perf monitor (dev-only).
 * Detects JS event-loop stalls by measuring timer drift.
 */

export type PerfSnapshot = {
  stalls: number
  lastStallMs: number
  worstStallMs: number
  p95StallMs: number
  // FrameBus pressure (optional; set by audio pipeline)
  frameBusQueue?: number
  frameBusDropped?: number
}

type Listener = (s: PerfSnapshot) => void

let snapshot: PerfSnapshot = { stalls: 0, lastStallMs: 0, worstStallMs: 0, p95StallMs: 0 }
let timer: any = null
const listeners: Set<Listener> = new Set()

// Keep the last N stall drifts to compute p95 (cheap, dev-only).
const STALLS_WINDOW = 40
const recentStalls: number[] = []

export function reportFrameBusStats(stats: { queue: number; dropped: number }) {
  snapshot = {
    ...snapshot,
    frameBusQueue: stats.queue,
    frameBusDropped: stats.dropped,
  }
  for (const l of listeners) l(snapshot)
}

export function startPerfMonitor(opts?: { tickMs?: number; stallThresholdMs?: number }) {
  if (timer) return
  const tickMs = opts?.tickMs ?? 250
  const stallThresholdMs = opts?.stallThresholdMs ?? 650

  let last = Date.now()
  timer = setInterval(() => {
    const now = Date.now()
    const drift = now - last - tickMs
    last = now
    if (drift >= stallThresholdMs) {
      recentStalls.push(Math.round(drift))
      while (recentStalls.length > STALLS_WINDOW) recentStalls.shift()

      const sorted = [...recentStalls].sort((a, b) => a - b)
      const p95 = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] : 0

      snapshot = {
        stalls: snapshot.stalls + 1,
        lastStallMs: Math.round(drift),
        worstStallMs: Math.max(snapshot.worstStallMs, Math.round(drift)),
        p95StallMs: Math.round(p95),
        frameBusQueue: snapshot.frameBusQueue,
        frameBusDropped: snapshot.frameBusDropped,
      }
      for (const l of listeners) l(snapshot)
    }
  }, tickMs)
}

export function stopPerfMonitor() {
  if (!timer) return
  clearInterval(timer)
  timer = null
}

export function getPerfSnapshot(): PerfSnapshot {
  return snapshot
}

export function subscribePerf(listener: Listener): () => void {
  listeners.add(listener)
  // immediate emit
  listener(snapshot)
  return () => {
    listeners.delete(listener)
  }
}
