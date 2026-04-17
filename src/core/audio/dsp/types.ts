export type DspSuppressionMode = 'off' | 'conservativeAdaptive'

export type SignalQualityGrade = 'excellent' | 'good' | 'fair' | 'poor' | 'blocked'

export type DspRouteHealth = 'stable' | 'unstable' | 'changed'

export type DspFrameInput = {
  sampleRate: number
  timestampMs?: number
  pcmBase64?: string
  samples?: Float32Array
  routeFingerprint?: string | null
}

export type DspFrameOutput = {
  ts: number
  rms: number
  peak: number
  vadProb: number
  voiced: boolean
  noiseFloorDb: number
  snrDb: number
  clipping: boolean
  voicedRatio: number
  clippingRate: number
  silenceRate: number
  signalQuality: SignalQualityGrade
  routeHealth: DspRouteHealth
}

export type DspSummary = {
  frames: number
  avgVadProb: number
  avgSnrDb: number
  avgNoiseFloorDb: number
  clippingRate: number
  silenceRate: number
  voicedRatio: number
  signalQuality: SignalQualityGrade
}

