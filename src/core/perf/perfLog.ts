import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'

import { getPerfSnapshot, subscribePerf } from './perfMonitor'
import { getQualityState, subscribeQuality } from './qualityRuntime'

export type PerfLogSample = {
  t: number
  p95StallMs: number
  worstStallMs: number
  lastStallMs: number
  stalls: number
  frameBusDropped: number
  frameBusQueue: number
  qualityMode: string
  deviceTier: string
}

export type PerfLog = {
  device: { tier: string; model?: string }
  mode: 'HIGH' | 'BALANCED' | 'LITE'
  windowSec: number
  samples: Array<{ t: number; p95StallMs: number; worstStallMs: number; frameBusDropped: number }>
}

let unsubPerf: null | (() => void) = null
let unsubQ: null | (() => void) = null
let startedAt = 0
let lastQuality = getQualityState()
const ring: PerfLogSample[] = []
const MAX_SAMPLES = 240 // ~4 minutes at 1Hz

export function startPerfLogging() {
  if (unsubPerf) return
  startedAt = Date.now()
  ring.length = 0
  unsubQ = subscribeQuality((q) => {
    lastQuality = q
  })
  unsubPerf = subscribePerf((s) => {
    const now = Date.now()
    const sample: PerfLogSample = {
      t: Math.round((now - startedAt) / 1000),
      p95StallMs: s.p95StallMs,
      worstStallMs: s.worstStallMs,
      lastStallMs: s.lastStallMs,
      stalls: s.stalls,
      frameBusDropped: s.frameBusDropped ?? 0,
      frameBusQueue: s.frameBusQueue ?? 0,
      qualityMode: lastQuality.resolved,
      deviceTier: lastQuality.tier,
    }
    ring.push(sample)
    while (ring.length > MAX_SAMPLES) ring.shift()
  })
}

export function stopPerfLogging() {
  if (unsubPerf) unsubPerf()
  if (unsubQ) unsubQ()
  unsubPerf = null
  unsubQ = null
}

export function getPerfLogSamples(): PerfLogSample[] {
  return [...ring]
}

export async function exportPerfLog(opts?: { model?: string }) {
  const q = getQualityState()
  const s = getPerfSnapshot()

  // Convert ring to the analyzer schema
  const out: PerfLog = {
    device: { tier: q.tier, model: opts?.model },
    mode: q.resolved,
    windowSec: ring.length ? ring[ring.length - 1].t : 0,
    samples: ring.map((x) => ({ t: x.t, p95StallMs: x.p95StallMs, worstStallMs: x.worstStallMs, frameBusDropped: x.frameBusDropped })),
  }

  const dir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ''
  const filename = `perf_log_${q.tier}_${q.resolved}_${Date.now()}.json`
  const uri = `${dir}${filename}`
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(out, null, 2), { encoding: FileSystem.EncodingType.UTF8 })

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri)
  }

  return { uri, summary: { p95: s.p95StallMs, worst: s.worstStallMs, drops: s.frameBusDropped ?? 0 } }
}
