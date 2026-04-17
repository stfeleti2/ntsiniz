import type { DspFrameOutput } from './dsp/types'
import type { PitchReading } from '@/core/pitch/pitchEngine'

export type RoomReadState = 'room_profile' | 'signal_lock' | 'phrase_capture' | 'range_estimate' | 'first_win' | 'failed'

export type RoomReadIssue =
  | null
  | 'noisyRoom'
  | 'tooQuiet'
  | 'noVoice'
  | 'tooLoud'
  | 'audioSetup'
  | 'clipping'
  | 'silenceDetected'
  | 'routeChanged'
  | 'permissionLost'

export type RoomReadSnapshot = {
  state: RoomReadState
  issue: RoomReadIssue
  helper: string
  banner: string
  phrase: string
  progress: number
  voicedRatio: number
  pitchBand: { low: number | null; high: number | null }
  shouldStop: boolean
  shouldFinalize: boolean
  metrics: {
    timeToFirstVoiceMs: number | null
    longestHoldMs: number
    glideSpanMidi: number
    sustainStability: number
  }
}

type RoomReadFrame = {
  nowMs: number
  dsp: DspFrameOutput
  reading: PitchReading | null
  midi: number | null
  permissionGranted: boolean
  routeFingerprint: string | null
}

type RoomReadMachineOptions = {
  startedAtMs?: number
}

const PHASE_WEIGHT: Record<Exclude<RoomReadState, 'failed' | 'first_win'>, number> = {
  room_profile: 0.18,
  signal_lock: 0.42,
  phrase_capture: 0.78,
  range_estimate: 0.94,
}

export function createRoomReadMachine(opts: RoomReadMachineOptions = {}) {
  return new RoomReadMachine(opts)
}

class RoomReadMachine {
  private state: RoomReadState = 'room_profile'
  private issue: RoomReadIssue = null

  private startedAtMs: number
  private enteredAtMs: number
  private routeFingerprint: string | null = null

  private roomNoiseDb: number[] = []
  private riseMidis: number[] = []
  private holdCents: number[] = []
  private holdStartAtMs: number | null = null
  private longestHoldMs = 0
  private timeToFirstVoiceMs: number | null = null
  private voicedFrames = 0
  private totalFrames = 0
  private pitchBand: { low: number | null; high: number | null } = { low: null, high: null }

  constructor(opts: RoomReadMachineOptions) {
    const started = opts.startedAtMs ?? Date.now()
    this.startedAtMs = started
    this.enteredAtMs = started
  }

  push(frame: RoomReadFrame): RoomReadSnapshot {
    if (!frame.permissionGranted) {
      this.fail('permissionLost')
      return this.snapshot(frame)
    }

    if (this.routeFingerprint == null) {
      this.routeFingerprint = frame.routeFingerprint
    } else if (frame.routeFingerprint && frame.routeFingerprint !== this.routeFingerprint) {
      this.fail('routeChanged')
      return this.snapshot(frame)
    }

    if (frame.dsp.clippingRate > 0.2 || frame.dsp.clipping) {
      this.fail('clipping')
      return this.snapshot(frame)
    }

    this.totalFrames += 1
    if (frame.dsp.voiced) {
      this.voicedFrames += 1
      if (this.timeToFirstVoiceMs == null) this.timeToFirstVoiceMs = frame.nowMs - this.startedAtMs
    }

    if (this.state === 'room_profile') this.handleRoomProfile(frame)
    else if (this.state === 'signal_lock') this.handleSignalLock(frame)
    else if (this.state === 'phrase_capture') this.handlePhraseCapture(frame)
    else if (this.state === 'range_estimate') this.handleRangeEstimate(frame)

    return this.snapshot(frame)
  }

  private handleRoomProfile(frame: RoomReadFrame) {
    this.roomNoiseDb.push(frame.dsp.noiseFloorDb)
    const elapsed = frame.nowMs - this.enteredAtMs
    if (elapsed < 1450) return
    const avgNoiseDb = mean(this.roomNoiseDb)
    if (avgNoiseDb > -28 || frame.dsp.signalQuality === 'poor') {
      this.fail('noisyRoom')
      return
    }
    this.transition('signal_lock', frame.nowMs)
  }

  private handleSignalLock(frame: RoomReadFrame) {
    const elapsed = frame.nowMs - this.enteredAtMs
    if (frame.dsp.voiced && frame.dsp.snrDb > 6 && frame.dsp.vadProb >= 0.56) {
      if (this.voicedFrames >= 6) {
        this.transition('phrase_capture', frame.nowMs)
        return
      }
    }

    if (elapsed < 4600) return
    if (frame.dsp.noiseFloorDb > -30 && frame.dsp.signalQuality === 'poor') {
      this.fail('noisyRoom')
      return
    }
    if (frame.dsp.snrDb < 4.6) {
      this.fail('tooQuiet')
      return
    }
    if (this.voicedFrames < 1 || this.timeToFirstVoiceMs == null) {
      this.fail(frame.dsp.silenceRate > 0.85 ? 'silenceDetected' : 'tooQuiet')
      return
    }
    this.fail('noVoice')
  }

  private handlePhraseCapture(frame: RoomReadFrame) {
    const elapsed = frame.nowMs - this.enteredAtMs
    const hasReading = !!frame.reading && frame.midi != null

    if (hasReading) {
      const midi = frame.midi!
      const cents = frame.reading?.cents ?? 0
      this.pitchBand = {
        low: this.pitchBand.low == null ? midi : Math.min(this.pitchBand.low, midi),
        high: this.pitchBand.high == null ? midi : Math.max(this.pitchBand.high, midi),
      }

      this.riseMidis.push(midi + cents / 100)
      this.holdCents.push(cents)
      if (Math.abs(cents) <= 30) {
        if (this.holdStartAtMs == null) this.holdStartAtMs = frame.nowMs
        this.longestHoldMs = Math.max(this.longestHoldMs, frame.nowMs - this.holdStartAtMs)
      } else {
        this.holdStartAtMs = null
      }
    }

    if (elapsed < 5000) return
    if (frame.dsp.snrDb < 5.4) {
      this.fail('tooQuiet')
      return
    }
    if (this.totalFrames > 20 && this.voicedFrames / this.totalFrames < 0.08) {
      this.fail('silenceDetected')
      return
    }
    if (this.longestHoldMs < 700) {
      this.fail('noVoice')
      return
    }
    this.transition('range_estimate', frame.nowMs)
  }

  private handleRangeEstimate(frame: RoomReadFrame) {
    const elapsed = frame.nowMs - this.enteredAtMs
    if (elapsed < 1650) return
    if (this.pitchBand.low == null || this.pitchBand.high == null) {
      this.fail('audioSetup')
      return
    }
    this.state = 'first_win'
  }

  private fail(issue: RoomReadIssue) {
    this.state = 'failed'
    this.issue = issue
  }

  private transition(next: Exclude<RoomReadState, 'failed' | 'first_win'>, nowMs: number) {
    this.state = next
    this.enteredAtMs = nowMs
  }

  private snapshot(frame: RoomReadFrame): RoomReadSnapshot {
    const voicedRatio = this.totalFrames > 0 ? this.voicedFrames / this.totalFrames : 0
    const sustainStability = stddev(this.holdCents.slice(-28))
    const glideSpanMidi = span(this.riseMidis)

    const banners = this.bannerFor(frame)
    const phrases = this.phraseFor()

    const progress =
      this.state === 'first_win'
        ? 1
        : this.state === 'failed'
          ? Math.max(0.05, this.progressForState())
          : this.progressForState()

    return {
      state: this.state,
      issue: this.issue,
      helper: banners.helper,
      banner: banners.banner,
      phrase: phrases,
      progress,
      voicedRatio,
      pitchBand: this.pitchBand,
      shouldStop: this.state === 'failed',
      shouldFinalize: this.state === 'first_win',
      metrics: {
        timeToFirstVoiceMs: this.timeToFirstVoiceMs,
        longestHoldMs: this.longestHoldMs,
        glideSpanMidi,
        sustainStability,
      },
    }
  }

  private progressForState() {
    if (this.state === 'room_profile') return PHASE_WEIGHT.room_profile
    if (this.state === 'signal_lock') return PHASE_WEIGHT.signal_lock
    if (this.state === 'phrase_capture') return PHASE_WEIGHT.phrase_capture
    if (this.state === 'range_estimate') return PHASE_WEIGHT.range_estimate
    return 0.12
  }

  private bannerFor(frame: RoomReadFrame) {
    if (this.state === 'failed') {
      return {
        banner: issueToBanner(this.issue),
        helper: issueToHelper(this.issue),
      }
    }
    if (this.state === 'room_profile') {
      return {
        banner: frame.dsp.noiseFloorDb > -30 ? 'Room too noisy. Try a quieter room.' : 'Nice, we can hear the room clearly.',
        helper: frame.dsp.noiseFloorDb > -30 ? 'Try a quieter room' : 'Stay quiet for room profiling',
      }
    }
    if (this.state === 'signal_lock') {
      return {
        banner: frame.dsp.vadProb >= 0.56 ? 'Signal lock in progress… keep that tone.' : 'Move a little closer and sing one easy vowel.',
        helper: frame.dsp.vadProb >= 0.56 ? 'Hold one clear note' : 'Move a little closer',
      }
    }
    if (this.state === 'phrase_capture') {
      return {
        banner: 'Great. Keep your note calm and stable.',
        helper: 'Hold the note',
      }
    }
    if (this.state === 'range_estimate') {
      return {
        banner: `Your vocal range is closest to ${estimateZone(this.pitchBand)}.`,
        helper: 'Keep the tone steady',
      }
    }
    return {
      banner: `Your vocal range is closest to ${estimateZone(this.pitchBand)}.`,
      helper: 'Record -> Playback -> Save best -> Next',
    }
  }

  private phraseFor() {
    if (this.state === 'room_profile') return 'Stay quiet for a quick room read'
    if (this.state === 'signal_lock') return 'Sing “ahh” at an easy volume'
    if (this.state === 'phrase_capture') return 'Hold one stable “ahh-ah-aa” line'
    if (this.state === 'range_estimate') return 'One more steady hold for range estimate'
    if (this.state === 'first_win') return 'First win captured'
    return 'Retry when ready'
  }
}

function issueToBanner(issue: RoomReadIssue) {
  if (issue === 'noisyRoom') return 'Room too noisy. Try a quieter space.'
  if (issue === 'tooQuiet') return 'Input too quiet. Move a little closer.'
  if (issue === 'noVoice') return 'We need a slightly longer steady sound.'
  if (issue === 'tooLoud' || issue === 'clipping') return 'Input is clipping. Soften your volume slightly.'
  if (issue === 'silenceDetected') return 'Silence detected. Start with a clear vowel.'
  if (issue === 'routeChanged') return 'Audio route changed. We paused to keep scoring fair.'
  if (issue === 'permissionLost') return 'Microphone permission is required for live scoring.'
  if (issue === 'audioSetup') return 'Audio setup needs a quick retry.'
  return 'Let us try that again.'
}

function issueToHelper(issue: RoomReadIssue) {
  if (issue === 'noisyRoom') return 'Try a quieter room'
  if (issue === 'tooQuiet') return 'Move a little closer'
  if (issue === 'tooLoud' || issue === 'clipping') return 'Sing a little softer'
  if (issue === 'silenceDetected') return 'Give one clear sustained tone'
  if (issue === 'routeChanged') return 'Reconnect your preferred mic'
  if (issue === 'permissionLost') return 'Enable microphone in Settings'
  if (issue === 'audioSetup') return 'Retry'
  return 'Hold the note'
}

function estimateZone(band: { low: number | null; high: number | null }) {
  if (band.low == null || band.high == null) return 'Alto'
  const center = (band.low + band.high) / 2
  if (center < 47) return 'Bass'
  if (center < 52) return 'Baritone'
  if (center < 57) return 'Tenor'
  if (center < 62) return 'Alto'
  if (center < 66) return 'Mezzo'
  return 'Soprano'
}

function mean(values: number[]) {
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function span(values: number[]) {
  if (values.length < 2) return 0
  return Math.max(...values) - Math.min(...values)
}

function stddev(values: number[]) {
  if (values.length < 2) return 0
  const avg = mean(values)
  const variance = mean(values.map((value) => (value - avg) ** 2))
  return Math.sqrt(variance)
}
