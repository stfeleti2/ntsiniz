import type { DeviceTier, QualityConfig, QualityMode } from './qualityTypes'
import { getPerfSnapshot } from './perfMonitor'

/**
 * Premium targeting:
 * - 50% MID
 * - 40% HIGH
 * - 10% LOW
 *
 * AUTO picks initial tier based on a *cheap heuristic* (screen pixel load)
 * and then adapts based on runtime perf snapshot (stalls + FrameBus pressure).
 */

export function classifyDeviceTier(input: { width: number; height: number; scale: number } | { widthPx: number; heightPx: number; pixelRatio: number; platform?: string }): DeviceTier {
  const width = 'width' in input ? input.width : input.widthPx
  const height = 'height' in input ? input.height : input.heightPx
  const scale = 'scale' in input ? input.scale : input.pixelRatio
  // Approx physical pixel load. This is not perfect, but it's stable, cheap, and dependency-free.
  const px = Math.round(width * height * Math.max(1, scale))
  // Conservative cutoffs: most modern phones land in MID/HIGH.
  if (px >= 1_100_000) return 'HIGH'
  if (px >= 700_000) return 'MID'
  return 'LOW'
}

export function initialQualityForTier(tier: DeviceTier): Exclude<QualityMode, 'AUTO'> {
  if (tier === 'HIGH') return 'HIGH'
  if (tier === 'MID') return 'BALANCED'
  return 'LITE'
}

// Gold targets (premium feel)
const GOLD = {
  HIGH: { p95: 160, worst: 800 },
  BALANCED: { p95: 220, worst: 900 },
}
// Floor targets (still supported)
const FLOOR = {
  LITE: { p95: 450, worst: 1100 },
}

export function getQualityConfig(mode: QualityMode, tier: DeviceTier): QualityConfig {
  // AUTO resolves to a concrete mode, but we keep mode label for display.
  const resolved: Exclude<QualityMode, 'AUTO'> = mode === 'AUTO' ? initialQualityForTier(tier) : mode

  if (resolved === 'HIGH') {
    return {
      mode,
      tier,
      animationScale: 1.0,
      animationDurationScale: 1.0,
      shadowScale: 1.0,
      blurEnabled: true,
      waveformBars: 180,
      audioAnalysisStride: 1,
      pitchMaxFramesPerSecond: 50,
      audioWriteBatchFrames: 3,
      ghostOverlayDetail: 'HIGH',
      enableOverlays: true,
      backgroundWorkIntervalMs: 20_000,
      stallP95TargetMs: GOLD.HIGH.p95,
      stallWorstTargetMs: GOLD.HIGH.worst,
    }
  }

  if (resolved === 'BALANCED') {
    return {
      mode,
      tier,
      animationScale: 0.9,
      animationDurationScale: 0.9,
      shadowScale: 0.85,
      blurEnabled: true,
      waveformBars: 140,
      audioAnalysisStride: 2,
      pitchMaxFramesPerSecond: 25,
      audioWriteBatchFrames: 2,
      ghostOverlayDetail: 'BALANCED',
      enableOverlays: true,
      backgroundWorkIntervalMs: 30_000,
      stallP95TargetMs: GOLD.BALANCED.p95,
      stallWorstTargetMs: GOLD.BALANCED.worst,
    }
  }

  // LITE
  return {
    mode,
    tier,
    animationScale: 0.65,
    animationDurationScale: 0.65,
    shadowScale: 0.6,
    blurEnabled: false,
    waveformBars: 90,
      audioAnalysisStride: 3,
    pitchMaxFramesPerSecond: 16,
    audioWriteBatchFrames: 1,
    ghostOverlayDetail: 'LOW',
    enableOverlays: false,
    backgroundWorkIntervalMs: 45_000,
    stallP95TargetMs: FLOOR.LITE.p95,
    stallWorstTargetMs: FLOOR.LITE.worst,
  }
}

type PerfLike = { p95StallMs: number; worstStallMs: number; frameBusDropped?: number }

export function shouldDegrade(currentResolvedMode: Exclude<QualityMode, 'AUTO'>): boolean
export function shouldDegrade(snapshot: PerfLike, currentResolvedMode: Exclude<QualityMode, 'AUTO'>): boolean
export function shouldDegrade(
  arg1: Exclude<QualityMode, 'AUTO'> | PerfLike,
  arg2?: Exclude<QualityMode, 'AUTO'>,
): boolean {
  const usingSnapshot = typeof arg1 === 'object'
  const s = usingSnapshot ? arg1 : getPerfSnapshot()
  const currentResolvedMode = usingSnapshot ? (arg2 as Exclude<QualityMode, 'AUTO'>) : (arg1 as Exclude<QualityMode, 'AUTO'>)
  if ((s.frameBusDropped ?? 0) > 0) return true

  // Compare against targets for current mode.
  const tier: DeviceTier = 'MID' // doesn't matter; targets keyed by mode below
  const cfg = getQualityConfig(currentResolvedMode, tier)
  if (s.p95StallMs >= cfg.stallP95TargetMs) return true
  if (s.worstStallMs >= cfg.stallWorstTargetMs) return true
  return false
}

export function shouldUpgrade(stableWindowMs: number, currentResolvedMode: Exclude<QualityMode, 'AUTO'>): boolean
export function shouldUpgrade(snapshot: PerfLike, currentResolvedMode: Exclude<QualityMode, 'AUTO'>): boolean
export function shouldUpgrade(
  arg1: number | PerfLike,
  currentResolvedMode: Exclude<QualityMode, 'AUTO'>,
): boolean {
  const usingSnapshot = typeof arg1 === 'object'
  const stableWindowMs = usingSnapshot ? 120_000 : arg1
  // Stable window is enforced by the runtime manager; here we just check snapshot is good.
  const s = usingSnapshot ? arg1 : getPerfSnapshot()
  if ((s.frameBusDropped ?? 0) > 0) return false
  const tier: DeviceTier = 'MID'
  const cfg = getQualityConfig(currentResolvedMode, tier)

  // Legacy snapshot-only call sites use stricter p95 guardrails.
  const p95Limit = usingSnapshot ? (currentResolvedMode === 'LITE' ? 220 : currentResolvedMode === 'BALANCED' ? 170 : 130) : cfg.stallP95TargetMs * 0.75
  if (s.p95StallMs > p95Limit) return false
  if (s.worstStallMs > cfg.stallWorstTargetMs * 0.75) return false
  return stableWindowMs >= 120_000
}


// Back-compat helpers used by tests and older call sites.
export const buildQualityConfig = getQualityConfig

export function degradeMode(current: Exclude<QualityMode, 'AUTO'>): Exclude<QualityMode, 'AUTO'> {
  return current === 'HIGH' ? 'BALANCED' : 'LITE'
}

export function upgradeMode(current: Exclude<QualityMode, 'AUTO'>, target?: Exclude<QualityMode, 'AUTO'>): Exclude<QualityMode, 'AUTO'> {
  if (target) {
    const rank: Record<Exclude<QualityMode, 'AUTO'>, number> = { LITE: 0, BALANCED: 1, HIGH: 2 }
    return rank[target] >= rank[current] ? target : current
  }
  return current === 'LITE' ? 'BALANCED' : 'HIGH'
}
