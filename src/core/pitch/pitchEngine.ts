import { pcmBase64ToFloat32 } from "../audio/pcm"
import { hzToNote } from "./hzToNote"
import { yinDetect, type YinWorkspace } from "./yin"
import { PitchSmoother } from "./smoothing"
import { vadFromRms } from "./vad"

export type PitchReading = {
  ts: number
  freqHz: number
  confidence: number
  note: string
  cents: number
  rms: number
  voiced: boolean
}

type Options = {
  sampleRate: number
  windowSize?: number // samples for analysis
  ringSize?: number
  minFreq?: number
  maxFreq?: number
  yinThreshold?: number
  noiseGateRms: number
  minConfidence: number
}

export class PitchEngine {
  private opts: Required<Options>
  private ring: Float32Array
  private write = 0
  private filled = 0
  private smoother = new PitchSmoother()
  // Reuse analysis window to avoid per-frame allocations (GC/jank on low-end devices).
  private windowBuf: Float32Array
  private yinWs: YinWorkspace | undefined
  private lastFrameRms = 0
  private lastFramePeak = 0
  private lastFrameClipped = false
  // Optional decode buffer for base64 PCM path (driver compatibility).
  // This avoids per-frame allocations when the platform can only deliver base64.
  private decodeBuf?: Float32Array

  constructor(opts: Options) {
    this.opts = {
      windowSize: opts.windowSize ?? 2048,
      ringSize: opts.ringSize ?? 4096,
      minFreq: opts.minFreq ?? 70,
      maxFreq: opts.maxFreq ?? 900,
      yinThreshold: opts.yinThreshold ?? 0.12,
      noiseGateRms: opts.noiseGateRms,
      minConfidence: opts.minConfidence,
      sampleRate: opts.sampleRate,
    }
    this.ring = new Float32Array(this.opts.ringSize)
    this.windowBuf = new Float32Array(this.opts.windowSize)
    // tauMax+1 is always <= windowSize, so allocating to windowSize guarantees reuse.
    this.yinWs = { diff: new Float32Array(this.opts.windowSize), cmnd: new Float32Array(this.opts.windowSize) }
  }

  reset() {
    this.write = 0
    this.filled = 0
    this.smoother.reset()
    this.lastFrameRms = 0
  }

  pushPcmBase64(pcmBase64: string): PitchReading | null {
    // Reuse buffer when possible to reduce GC.
    const frame = pcmBase64ToFloat32(pcmBase64, this.decodeBuf)
    this.decodeBuf = frame
    this.ingestSamples(frame)
    return this.analyze()
  }

  pushSamples(frame: Float32Array): PitchReading | null {
    this.ingestSamples(frame)
    return this.analyze()
  }

  /**
   * Fast path: write samples into the ring without doing YIN.
   * Use this to reduce CPU by analyzing every Nth frame.
   */
  ingestSamples(frame: Float32Array) {
    this.writeFrame(frame)
  }

  /** Run pitch analysis over the current window (if enough data exists). */
  analyze(): PitchReading | null {
    return this.read()
  }

  getLastFrameRms() {
    return this.lastFrameRms
  }

  getLastFramePeak() {
    return this.lastFramePeak
  }

  getLastFrameClipped() {
    return this.lastFrameClipped
  }

  private writeFrame(frame: Float32Array) {
    // Track RMS for diagnostics without a second pass elsewhere.
    let sum = 0
    let peak = 0
    for (let i = 0; i < frame.length; i++) {
      const v = frame[i]
      this.ring[this.write] = v
      this.write = (this.write + 1) % this.ring.length
      this.filled = Math.min(this.ring.length, this.filled + 1)
      sum += v * v
      const a = Math.abs(v)
      if (a > peak) peak = a
    }
    this.lastFrameRms = Math.sqrt(sum / Math.max(1, frame.length))
    this.lastFramePeak = peak
    // Conservative clip detection; true peaks can be higher than samples, but this is a safe warning.
    this.lastFrameClipped = peak >= 0.98
  }

  private read(): PitchReading | null {
    if (this.filled < this.opts.windowSize) return null

    const { w, r } = this.getWindowAndRms(this.opts.windowSize)
    const vad = vadFromRms(r, this.opts.noiseGateRms)
    if (!vad.voiced) return null

    const yin = yinDetect(w, this.opts.sampleRate, {
      minFreq: this.opts.minFreq,
      maxFreq: this.opts.maxFreq,
      threshold: this.opts.yinThreshold,
    }, this.yinWs)

    if (!yin.freqHz || yin.confidence < this.opts.minConfidence) return null

    const smoothHz = this.smoother.push(yin.freqHz)
    const noteInfo = hzToNote(smoothHz)

    return {
      ts: Date.now(),
      freqHz: smoothHz,
      confidence: yin.confidence,
      note: noteInfo.note,
      cents: noteInfo.cents,
      rms: r,
      voiced: true,
    }
  }

  private getWindowAndRms(size: number) {
    // Keep it flexible (in case windowSize is tuned), but still reuse buffers.
    if (this.windowBuf.length !== size) {
      this.windowBuf = new Float32Array(size)
      this.yinWs = { diff: new Float32Array(size), cmnd: new Float32Array(size) }
    }
    const out = this.windowBuf
    const start = (this.write - size + this.ring.length) % this.ring.length
    let sum = 0
    for (let i = 0; i < size; i++) {
      const v = this.ring[(start + i) % this.ring.length]
      out[i] = v
      sum += v * v
    }
    const r = Math.sqrt(sum / Math.max(1, size))
    return { w: out, r }
  }
}
