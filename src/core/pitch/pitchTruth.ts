import type { PitchReading } from './pitchEngine'
import { PitchEngine } from './pitchEngine'

export type PitchTruthConfig = {
  sampleRate: number
  noiseGateRms: number
  minConfidence: number
  /**
   * How many consecutive frames must agree before we allow a note change.
   * This is a simple hysteresis that improves stability and user trust.
   */
  noteChangeConfirmFrames?: number
}

/**
 * Single source of truth for pitch readings.
 */
export class PitchTruth {
  private engine: PitchEngine
  private confirmN: number
  private lastStable: PitchReading | null = null
  private pendingNote: { note: string; frames: number; reading: PitchReading } | null = null

  constructor(cfg: PitchTruthConfig) {
    this.engine = new PitchEngine({
      sampleRate: cfg.sampleRate,
      noiseGateRms: cfg.noiseGateRms,
      minConfidence: cfg.minConfidence,
    })
    this.confirmN = Math.max(1, Math.floor(cfg.noteChangeConfirmFrames ?? 2))
  }

  reset() {
    this.engine.reset()
    this.lastStable = null
    this.pendingNote = null
  }

  pushPcmBase64(pcmBase64: string): PitchReading | null {
    const r = this.engine.pushPcmBase64(pcmBase64)
    return this.hysteresis(r)
  }

  pushSamples(frame: Float32Array): PitchReading | null {
    const r = this.engine.pushSamples(frame)
    return this.hysteresis(r)
  }

  /** Ingest samples without running YIN. */
  ingestSamples(frame: Float32Array) {
    this.engine.ingestSamples(frame)
  }

  /** Analyze current window and apply hysteresis. */
  analyze(): PitchReading | null {
    return this.hysteresis(this.engine.analyze())
  }

  getLastFrameRms() {
    return this.engine.getLastFrameRms()
  }

  getLastFramePeak() {
    return this.engine.getLastFramePeak()
  }

  getLastFrameClipped() {
    return this.engine.getLastFrameClipped()
  }

  getLastStableReading() {
    return this.lastStable
  }

  private hysteresis(r: PitchReading | null): PitchReading | null {
    if (!r) {
      this.pendingNote = null
      return null
    }
    if (!this.lastStable) {
      this.lastStable = r
      this.pendingNote = null
      return r
    }
    if (r.note === this.lastStable.note) {
      this.lastStable = r
      this.pendingNote = null
      return r
    }

    if (!this.pendingNote || this.pendingNote.note !== r.note) {
      this.pendingNote = { note: r.note, frames: 1, reading: r }
      return this.lastStable
    }

    this.pendingNote.frames += 1
    this.pendingNote.reading = r
    if (this.pendingNote.frames >= this.confirmN) {
      this.lastStable = this.pendingNote.reading
      this.pendingNote = null
      return this.lastStable
    }
    return this.lastStable
  }
}
