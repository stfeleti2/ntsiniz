export type QualityMode = 'AUTO' | 'HIGH' | 'BALANCED' | 'LITE'

export type DeviceTier = 'HIGH' | 'MID' | 'LOW'

/**
 * QualityConfig controls *effects* and *background work*, never typography/spacing/layout.
 * This enforces the premium guardrail: we degrade intensity, not design quality.
 */
export type QualityConfig = {
  mode: QualityMode
  tier: DeviceTier

  // Visual effect scalars
  animationScale: number
  /** Back-compat alias for legacy callers. */
  animationDurationScale?: number
  shadowScale: number
  blurEnabled: boolean

  // Audio/visual detail
  waveformBars: number

  // Audio analysis cadence: analyze every N frames (ingest still happens every frame)
  audioAnalysisStride: number
  /** Back-compat alias used in diagnostics. */
  pitchMaxFramesPerSecond?: number

  // Recording IO: how many 20ms frames to batch before flushing to the native writer.
  // (Pitch analysis remains independent; this only reduces bridge overhead.)
  audioWriteBatchFrames: number

  // Ghost overlay detail control (degrades effects, not layout).
  ghostOverlayDetail: 'HIGH' | 'BALANCED' | 'LOW'
  /** Back-compat alias used in diagnostics. */
  enableOverlays?: boolean

  // Background work scheduling (cloud sync, cleanup, etc.)
  backgroundWorkIntervalMs: number

  // Runtime perf targets
  stallP95TargetMs: number
  stallWorstTargetMs: number
}
