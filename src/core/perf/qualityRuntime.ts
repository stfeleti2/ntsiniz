import { Dimensions, PixelRatio } from 'react-native'
import type { DeviceTier, QualityConfig, QualityMode } from './qualityTypes'
import { classifyDeviceTier, getQualityConfig as computeQualityConfig, initialQualityForTier, shouldDegrade, shouldUpgrade } from './qualityHeuristics'
import { startPerfMonitor } from './perfMonitor'

type Listener = (q: { mode: QualityMode; resolved: Exclude<QualityMode, 'AUTO'>; tier: DeviceTier; config: QualityConfig }) => void

const listeners = new Set<Listener>()
let timer: any = null

let tier: DeviceTier = 'MID'
let mode: QualityMode = 'AUTO'
let resolved: Exclude<QualityMode, 'AUTO'> = 'BALANCED'
let stableSince = Date.now()

export function initQualityRuntime(opts?: { initialMode?: QualityMode }) {
  if (timer) return

  const { width, height } = Dimensions.get('window')
  const scale = PixelRatio.get()
  tier = classifyDeviceTier({ width, height, scale })

  mode = opts?.initialMode ?? 'AUTO'
  resolved = mode === 'AUTO' ? initialQualityForTier(tier) : mode
  stableSince = Date.now()
  emit()

  // Perf snapshot is used by AUTO mode heuristics (stalls + FrameBus pressure).
  // This is safe to run in production; it stays local unless the user opts into telemetry.
  startPerfMonitor()

  // AUTO adaptation loop (cheap). We do not adapt in manual modes.
  timer = setInterval(() => {
    if (mode !== 'AUTO') return

    if (shouldDegrade(resolved)) {
      stableSince = Date.now()
      resolved = resolved === 'HIGH' ? 'BALANCED' : 'LITE'
      emit()
      return
    }

    const stableWindowMs = Date.now() - stableSince
    if (shouldUpgrade(stableWindowMs, resolved)) {
      // Upgrade one step at a time.
      resolved = resolved === 'LITE' ? 'BALANCED' : 'HIGH'
      stableSince = Date.now()
      emit()
    }
  }, 1000)
}

export function stopQualityRuntime() {
  if (!timer) return
  clearInterval(timer)
  timer = null
}

export function setQualityOverride(next: QualityMode) {
  mode = next
  resolved = mode === 'AUTO' ? initialQualityForTier(tier) : mode
  stableSince = Date.now()
  emit()
}

export function getQualityState() {
  const config = computeQualityConfig(mode, tier)
  return { mode, resolved, tier, config }
}

export function getQualityConfigSnapshot(): QualityConfig {
  return computeQualityConfig(mode, tier)
}

// Back-compat name used by existing imports.
export const getQualityConfig = getQualityConfigSnapshot

export function subscribeQuality(listener: Listener): () => void {
  listeners.add(listener)
  listener(getQualityState())
  return () => {
    listeners.delete(listener)
  }
}

function emit() {
  const st = getQualityState()
  for (const l of listeners) l(st)
}
