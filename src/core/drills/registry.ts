import type { Drill } from "./schema"
import { ensureMicPermission, startMic } from "../audio/micStream"
import { configureForVocalCapture, setPreferredInput, getCurrentRoute } from "../audio/routeManager"
import type { Settings } from "../storage/settingsRepo"
import type { VoiceProfile } from "../storage/profileRepo"
import { runDrillWithDrivers } from "./drillExecutor"
import { midiToHz } from "../pitch/hzToNote"
import { parseNoteToMidi } from "../pitch/noteParse"
import { logger } from "../observability/logger"

// Platform-side helpers (Expo audio playback + tones + sfx)
import { playReferenceForDrill } from "@/core/audio/referenceTones"
import { playSfx, stopSfx } from "@/core/audio/sfx"
import { stopTone } from "@/core/audio/tonePlayer"
import { createAttemptWavRecorder } from "@/core/audio/attemptWavRecorder"

export type DrillRunnerContext = {
  drill: Drill
  settings: Settings
  profile: VoiceProfile
  /** Optional: allows UI to cancel an in-flight drill run. */
  abortSignal?: any
  /** Optional: Ghost Guide overlay telemetry. */
  onGhostFrame?: (ev: any) => void
}

export type DrillRunResult = {
  score: number
  metrics: any
  tip: string
  summary: string
  profileDelta?: Partial<VoiceProfile>
}

export type DrillRunnerPlugin = {
  run: (ctx: DrillRunnerContext) => Promise<DrillRunResult>
}

/**
 * For Phase-1 we use one robust runner-machine that supports all drill types.
 * This registry exists so we can swap/extend per drill type later (e.g. different VAD,
 * different UI, different timers).
 */
export function getDrillRunnerFor(_type: Drill["type"]): DrillRunnerPlugin {
  return universalRunner
}

const universalRunner: DrillRunnerPlugin = {
  async run({ drill, settings, profile, abortSignal, onGhostFrame }) {
    // Optional per-attempt WAV capture (for PlaybackOverlay + sharing). Stored in cache.
    // This is app-side behavior, so it lives in the app registry (excluded from core build/tests).
    let recorder = createAttemptWavRecorder({ sampleRate: 48000, waveformBars: 72 })
    let recorderSampleRate = 48000
    let micSampleRate = recorderSampleRate
    const ensureRecorder = (sr: number) => {
      if (sr === recorderSampleRate) return
      // Reset recorder if sample rate changes to keep WAV headers correct.
      recorder.abort()
      recorder = createAttemptWavRecorder({ sampleRate: sr, waveformBars: 72 })
      recorderSampleRate = sr
    }

    let result: any
    try {
      result = await runDrillWithDrivers(
        { drill, settings, profile },
        {
          ensureMicPermission: async () => {
            if (settings.qaBypassMicPermission) return true

            const ok = await ensureMicPermission()
            if (!ok) return false

            // Configure platform audio session / focus for best vocal capture quality.
            await configureForVocalCapture({
              allowBluetooth: settings.allowBluetoothMic ?? true,
              preferBuiltInMic: settings.preferBuiltInMic ?? false,
              preferredSampleRateHz: 48000,
              preferredIOBufferDurationMs: 10,
            }).catch((e) => logger.warn('configureForVocalCapture failed', e))

            if (settings.preferredInputUid) {
              await setPreferredInput(settings.preferredInputUid).catch((e) => logger.warn('setPreferredInput failed', e))
            }

            // If route reports a stable sample rate, honor it; otherwise default to 48k for singing.
            const route = await getCurrentRoute().catch((e) => {
              logger.warn('getCurrentRoute failed', e)
              return null
            })
            const desiredSampleRate = route?.sampleRateHz && route.sampleRateHz >= 32000 ? Math.round(route.sampleRateHz) : 48000
            micSampleRate = desiredSampleRate
            ensureRecorder(desiredSampleRate)
            return true
          },

          negotiateMicConfig: async (preferred) => {
            const preferredRate = preferred?.sampleRate ?? 48000
            // If ensureMicPermission hasn't run yet, we still honor preferred rate.
            const sr = micSampleRate || preferredRate
            const frameDurationMs = preferred?.frameDurationMs ?? 20
            return { sampleRate: sr, frameDurationMs }
          },

          startMic: async (cfg, onFrame, onError) => {
            if (settings.qaSimulatedMic) {
              const effectiveCfg = { ...cfg, sampleRate: micSampleRate }
              ensureRecorder(effectiveCfg.sampleRate)
              return await startSimulatedMic({
                drill,
                cfg: effectiveCfg,
                onFrame: (f) => {
                  recorder.push(f)
                  onFrame(f)
                },
              })
            }

            const effectiveCfg = { ...cfg, sampleRate: micSampleRate }
            ensureRecorder(effectiveCfg.sampleRate)
            return await startMic(
              effectiveCfg,
              (ev) => {
                const f = { pcmBase64: (ev as any)?.pcmBase64 } as any
                recorder.push(f)
                onFrame(f)
              },
              onError,
            )
          },

          playReferenceForDrill,
          stopTone,
          playSfx: async (name: string) => playSfx(name as any),
          stopSfx: async () => stopSfx(),
          onGhostFrame,
        },
        { signal: abortSignal },
      )
    } catch (e) {
      recorder.abort()
      throw e
    }

    const audio = await recorder.finalize().catch(() => null)
    if (audio) {
      result.metrics = {
        ...(result.metrics ?? {}),
        audioUri: audio.uri,
        audioFormat: 'wav',
        audioSampleRate: audio.sampleRate,
        audioDurationMs: audio.durationMs,
        waveformPeaks: audio.waveformPeaks,
        recordingStats: (audio as any).recordingStats,
      }
    }
    return result
  },
}

async function startSimulatedMic({
  drill,
  cfg,
  onFrame,
}: {
  drill: Drill
  cfg: { sampleRate: number; frameDurationMs: number }
  onFrame: (f: { samples: Float32Array }) => void
}) {
  const sr = cfg.sampleRate
  const frameMs = cfg.frameDurationMs
  const frameN = Math.round((sr * frameMs) / 1000)

  const targets = stepTargetsHz(drill)
  const hold = Math.max(120, drill.holdMs)
  const gap = 350
  const amp = 0.65

  let step = 0
  let stepMs = 0
  let phase = 0

  const tick = () => {
    const samples = new Float32Array(frameN)
    const hz = targets[step] ?? targets[targets.length - 1] ?? 440

    // Between steps: emit silence so the runner can advance cleanly.
    const inGap = stepMs >= hold && stepMs < hold + gap
    if (!inGap) {
      const w = (2 * Math.PI * hz) / sr
      for (let i = 0; i < frameN; i++) samples[i] = Math.sin((phase + i) * w) * amp
      phase += frameN
    }

    onFrame({ samples })

    stepMs += frameMs
    if (stepMs >= hold + gap) {
      step += 1
      stepMs = 0
    }
  }

  const id = setInterval(tick, frameMs)
  return {
    stop: async () => {
      clearInterval(id)
    },
  }
}

function stepTargetsHz(drill: Drill): number[] {
  try {
    if (drill.type === "match_note" && drill.target?.note) {
      const m = parseNoteToMidi(drill.target.note)
      return [midiToHz(m ?? 69)]
    }

    if (drill.type === "interval" && drill.target?.note && typeof drill.intervalSemitones === "number") {
      const start = parseNoteToMidi(drill.target.note)
      const s = start ?? 69
      return [midiToHz(s), midiToHz(s + drill.intervalSemitones)]
    }

    if (drill.type === "melody_echo" && Array.isArray(drill.melody) && drill.melody.length) {
      return drill.melody.map((n) => midiToHz(parseNoteToMidi(n.note) ?? 69))
    }

    if (drill.type === "slide" && drill.from?.note && drill.to?.note) {
      const a = parseNoteToMidi(drill.from.note)
      const b = parseNoteToMidi(drill.to.note)
      return [midiToHz(a ?? 69), midiToHz(b ?? 72)]
    }

    if (drill.target?.note) return [midiToHz(parseNoteToMidi(drill.target.note) ?? 69)]
  } catch {
    // ignore
  }
  return [440]
}
