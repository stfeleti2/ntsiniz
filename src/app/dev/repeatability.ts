import type { Drill } from '@/core/drills/schema'
import type { Settings } from '@/core/storage/settingsRepo'
import type { VoiceProfile } from '@/core/storage/profileRepo'
import { PitchTruth } from '@/core/pitch/pitchTruth'
import { DrillRunner } from '@/core/drills/runnerMachine'

import { rms } from '@/core/audio/pcm'

export type RepeatabilityRun = {
  score: number
  metrics: any
  frames: number
  voicedFrames: number
  nullFrames: number
  avgRms: number
}

/**
 * Re-analyze a pre-recorded WAV sample buffer through the same runner logic.
 * Dev-only: we temporarily override Date.now() so runner timing is deterministic.
 */
export function analyzeSamplesForDrill(params: {
  drill: Drill
  settings: Settings
  profile: VoiceProfile
  sampleRate: number
  samples: Float32Array
  frameMs?: number
}): RepeatabilityRun {
  const { drill, settings, sampleRate, samples } = params
  const frameMs = params.frameMs ?? 20
  const frameN = Math.max(1, Math.round((sampleRate * frameMs) / 1000))

  const sensitivity = Math.max(0.5, Math.min(2, settings.sensitivity ?? 1))
  const noiseGate = Math.max(0, Math.min(0.2, (settings.noiseGateRms ?? 0.02) / sensitivity))

  const pitch = new PitchTruth({
    sampleRate,
    noiseGateRms: noiseGate,
    minConfidence: 0.55 / sensitivity,
    noteChangeConfirmFrames: 2,
  })

  const runner = new DrillRunner(drill)

  const originalNow = Date.now
  let fakeNow = originalNow()
  ;(Date as any).now = () => fakeNow
  try {
    runner.start()
    // advance through countdown deterministically
    fakeNow += drill.countdownMs

    let frames = 0
    let voicedFrames = 0
    let nullFrames = 0
    let rmsSum = 0

    for (let off = 0; off < samples.length; off += frameN) {
      const frame = samples.subarray(off, Math.min(samples.length, off + frameN))
      if (frame.length < frameN) break

      const r = rms(frame)
      rmsSum += r

      const reading = pitch.pushSamples(frame)
      frames += 1
      if (reading) voicedFrames += 1
      else nullFrames += 1

      const out = runner.tick(reading)
      fakeNow += frameMs
      if (out) {
        return {
          score: out.score,
          metrics: out.metrics,
          frames,
          voicedFrames,
          nullFrames,
          avgRms: frames ? rmsSum / frames : 0,
        }
      }
    }

    return {
      score: 0,
      metrics: { error: 'eof' },
      frames,
      voicedFrames,
      nullFrames,
      avgRms: frames ? rmsSum / frames : 0,
    }
  } finally {
    ;(Date as any).now = originalNow
  }
}
