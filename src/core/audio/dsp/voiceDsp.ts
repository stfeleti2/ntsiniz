import type { DspFrameInput, DspFrameOutput, DspSummary, DspSuppressionMode, SignalQualityGrade } from './types'
import { pcmBase64ToFloat32, rms } from '../pcm'

const EPS = 1e-7
const DEFAULT_NOISE_FLOOR = 0.004
const QUALITY_WINDOW = 90

export function createVoiceDspSession(options: {
  sampleRate: number
  suppressionMode?: DspSuppressionMode
}) {
  return new VoiceDspSession(options)
}

class VoiceDspSession {
  private readonly sampleRate: number
  private readonly suppressionMode: DspSuppressionMode
  private readonly native = loadNativeDsp()
  private readonly nativeSessionId: string | null

  private frameCount = 0
  private sumVad = 0
  private sumSnr = 0
  private sumNoiseFloorDb = 0
  private voicedFrames = 0
  private clippedFrames = 0
  private silenceFrames = 0

  private noiseFloor = DEFAULT_NOISE_FLOOR
  private routeFingerprint: string | null = null
  private routeChangedAt: number | null = null

  private recentVoiced: number[] = []
  private recentClipping: number[] = []
  private recentSilence: number[] = []

  constructor(options: { sampleRate: number; suppressionMode?: DspSuppressionMode }) {
    this.sampleRate = options.sampleRate
    this.suppressionMode = options.suppressionMode ?? 'conservativeAdaptive'
    try {
      this.nativeSessionId = this.native?.createSession
        ? this.native.createSession({
            sampleRate: options.sampleRate,
            suppressionMode: this.suppressionMode,
          })
        : null
    } catch {
      this.nativeSessionId = null
    }
  }

  pushFrame(input: DspFrameInput): DspFrameOutput {
    const ts = input.timestampMs ?? Date.now()
    const nativeOut = this.nativeSessionId && input.pcmBase64 ? this.tryNativeFrame(this.nativeSessionId, input.pcmBase64, input.sampleRate) : null
    const needsJs = !nativeOut || !!input.samples
    const samples = needsJs ? resolveSamples(input) : null
    const frameRms = samples ? rms(samples) : dbToLinear((nativeOut?.noiseFloorDb ?? -40) + (nativeOut?.snrDb ?? 0))
    const peak = samples ? computePeak(samples) : nativeOut?.clipping ? 0.99 : 0.08
    const clipping = nativeOut?.clipping ?? peak >= 0.985

    this.applyRouteHealth(input.routeFingerprint ?? null, ts)
    const routeHealth = this.routeHealth(ts)

    const noiseBefore = nativeOut ? dbToLinear(nativeOut.noiseFloorDb) : this.noiseFloor
    const snrDb = nativeOut?.snrDb ?? ratioToDb(frameRms, noiseBefore)
    const vadProb = nativeOut?.vadProb ?? estimateVadProb(frameRms, snrDb, zeroCrossingRate(samples ?? new Float32Array(0)))
    const voiced = vadProb >= 0.56 && frameRms >= noiseBefore * 1.12

    if (nativeOut) {
      this.noiseFloor = clampNoiseFloor(dbToLinear(nativeOut.noiseFloorDb))
    } else if (!voiced) {
      const smoothing = this.suppressionMode === 'off' ? 0.02 : 0.08
      this.noiseFloor = clampNoiseFloor(this.noiseFloor * (1 - smoothing) + frameRms * smoothing)
    } else {
      // Conservative denoise floor drift so we avoid over-shaping sung timbre.
      this.noiseFloor = clampNoiseFloor(this.noiseFloor * 0.995 + frameRms * 0.005)
    }

    this.frameCount += 1
    if (voiced) this.voicedFrames += 1
    if (clipping) this.clippedFrames += 1
    if (vadProb < 0.24) this.silenceFrames += 1

    this.sumVad += vadProb
    this.sumSnr += snrDb
    this.sumNoiseFloorDb += ratioToDb(this.noiseFloor, 1)

    const voicedRatio = pushWindowValue(this.recentVoiced, nativeOut?.voicedRatio ?? (voiced ? 1 : 0))
    const clippingRate = pushWindowValue(this.recentClipping, clipping ? 1 : 0)
    const silenceRate = pushWindowValue(this.recentSilence, vadProb < 0.24 ? 1 : 0)

    const jsQuality = qualityFrom({
      snrDb,
      clippingRate,
      silenceRate,
      voicedRatio,
      routeHealth,
    })

    return {
      ts,
      rms: frameRms,
      peak,
      vadProb,
      voiced,
      noiseFloorDb: ratioToDb(this.noiseFloor, 1),
      snrDb,
      clipping,
      voicedRatio,
      clippingRate,
      silenceRate,
      signalQuality: jsQuality,
      routeHealth,
    }
  }

  summary(): DspSummary {
    const frames = Math.max(1, this.frameCount)
    const voicedRatio = this.voicedFrames / frames
    const clippingRate = this.clippedFrames / frames
    const silenceRate = this.silenceFrames / frames
    const avgSnrDb = this.sumSnr / frames
    const avgVadProb = this.sumVad / frames
    const avgNoiseFloorDb = this.sumNoiseFloorDb / frames
    return {
      frames: this.frameCount,
      avgVadProb,
      avgSnrDb,
      avgNoiseFloorDb,
      clippingRate,
      silenceRate,
      voicedRatio,
      signalQuality: qualityFrom({
        snrDb: avgSnrDb,
        clippingRate,
        silenceRate,
        voicedRatio,
        routeHealth: this.routeHealth(Date.now()),
      }),
    }
  }

  async close() {
    if (this.nativeSessionId && this.native?.closeSession) {
      try {
        this.native.closeSession(this.nativeSessionId)
      } catch {
        // no-op
      }
    }
    return Promise.resolve()
  }

  private tryNativeFrame(sessionId: string, pcmBase64: string, sampleRate: number): NativeDspFrame | null {
    try {
      if (!this.native?.processFrame) return null
      return this.native.processFrame(sessionId, pcmBase64, sampleRate)
    } catch {
      return null
    }
  }

  private applyRouteHealth(nextFingerprint: string | null, ts: number) {
    if (!nextFingerprint) return
    if (!this.routeFingerprint) {
      this.routeFingerprint = nextFingerprint
      return
    }
    if (nextFingerprint === this.routeFingerprint) return
    this.routeFingerprint = nextFingerprint
    this.routeChangedAt = ts
  }

  private routeHealth(ts: number): DspFrameOutput['routeHealth'] {
    if (!this.routeChangedAt) return 'stable'
    const delta = ts - this.routeChangedAt
    if (delta < 900) return 'changed'
    if (delta < 4000) return 'unstable'
    return 'stable'
  }
}

type NativeDspFrame = {
  vadProb: number
  noiseFloorDb: number
  snrDb: number
  clipping: boolean
  voicedRatio: number
  signalQuality: SignalQualityGrade
}

type NativeDspModule = {
  createSession: (opts: { sampleRate: number; suppressionMode: DspSuppressionMode }) => string
  processFrame: (sessionId: string, pcmBase64: string, sampleRate: number) => NativeDspFrame
  closeSession: (sessionId: string) => void
}

let cachedNativeModule: NativeDspModule | null | undefined

function loadNativeDsp(): NativeDspModule | null {
  if (cachedNativeModule !== undefined) return cachedNativeModule
  try {
    const req = (globalThis as any)?.require ?? (0, eval)('require')
    const mod = req('ntsiniz-voice-dsp')
    const api = (mod?.default ?? mod) as Partial<NativeDspModule>
    if (typeof api?.createSession === 'function' && typeof api?.processFrame === 'function' && typeof api?.closeSession === 'function') {
      cachedNativeModule = api as NativeDspModule
      return cachedNativeModule
    }
  } catch {
    // no-op
  }
  cachedNativeModule = null
  return cachedNativeModule
}

function resolveSamples(input: DspFrameInput): Float32Array {
  if (input.samples) return input.samples
  if (input.pcmBase64) return pcmBase64ToFloat32(input.pcmBase64)
  return new Float32Array(0)
}

function ratioToDb(value: number, floor: number) {
  return 20 * Math.log10((value + EPS) / (floor + EPS))
}

function dbToLinear(db: number) {
  return 10 ** (db / 20)
}

function computePeak(samples: Float32Array) {
  let peak = 0
  for (let idx = 0; idx < samples.length; idx += 1) {
    const v = Math.abs(samples[idx] ?? 0)
    if (v > peak) peak = v
  }
  return peak
}

function zeroCrossingRate(samples: Float32Array) {
  if (samples.length < 2) return 0
  let crossings = 0
  for (let idx = 1; idx < samples.length; idx += 1) {
    if ((samples[idx - 1] ?? 0) * (samples[idx] ?? 0) < 0) crossings += 1
  }
  return crossings / (samples.length - 1)
}

function estimateVadProb(frameRms: number, snrDb: number, zcr: number) {
  const snrComponent = sigmoid((snrDb - 6) / 4.5)
  const levelComponent = sigmoid((frameRms - 0.011) * 160)
  const zcrPenalty = zcr > 0.35 ? 0.8 : 1
  return clamp01((snrComponent * 0.62 + levelComponent * 0.38) * zcrPenalty)
}

function qualityFrom(input: {
  snrDb: number
  clippingRate: number
  silenceRate: number
  voicedRatio: number
  routeHealth: DspFrameOutput['routeHealth']
}): SignalQualityGrade {
  if (input.routeHealth !== 'stable') return 'blocked'
  if (input.clippingRate > 0.16) return 'poor'
  if (input.snrDb < 5) return 'poor'
  if (input.silenceRate > 0.82 && input.voicedRatio < 0.08) return 'poor'
  if (input.snrDb < 10) return 'fair'
  if (input.voicedRatio < 0.12 && input.silenceRate > 0.7) return 'fair'
  if (input.snrDb < 17) return 'good'
  return 'excellent'
}

function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-value))
}

function pushWindowValue(window: number[], value: number) {
  window.push(value)
  if (window.length > QUALITY_WINDOW) window.shift()
  return window.reduce((sum, item) => sum + item, 0) / Math.max(1, window.length)
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function clampNoiseFloor(value: number) {
  return Math.max(0.0008, Math.min(0.18, value))
}
