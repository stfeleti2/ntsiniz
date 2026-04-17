import test from "node:test"
import assert from "node:assert/strict"

import { resetPermissionGate } from "../audio/permissionGate"
import { runDrillWithDrivers } from "../drills/drillExecutor"

type AnyDrill = any

function makeSineFrame(freqHz: number, sampleRate: number, durationMs: number, phase: number, amp = 0.65) {
  const n = Math.round((sampleRate * durationMs) / 1000)
  const out = new Float32Array(n)
  const w = (2 * Math.PI * freqHz) / sampleRate
  for (let i = 0; i < n; i++) out[i] = Math.sin((phase + i) * w) * amp
  return { samples: out, phase: phase + n }
}

const baseSettings: any = {
  language: "en",
  voiceCoaching: false,
  coachPlayback: true,
  listenThenSing: true,
  soundCues: false,
  sensitivity: 2,
  noiseGateRms: 0,
  hasCalibrated: true,
}

const baseProfile: any = {
  id: "default",
  updatedAt: 0,
  biasCents: 0,
  driftCentsPerSec: 0,
  wobbleCents: 0,
  overshootRate: 0,
  voicedRatio: 0.9,
  confidence: 0.8,
}

test("runDrillWithDrivers: respects Listen-Then-Sing ordering (reference playback before mic capture)", async () => {
  resetPermissionGate()

  let now = 0
  const realNow = Date.now
  ;(Date as any).now = () => now

  const calls: string[] = []
  let refDone = false

  const drill: AnyDrill = {
    id: "d_test",
    title: "A4 Lock",
    type: "match_note",
    level: 1,
    tuneWindowCents: 35,
    holdMs: 80,
    countdownMs: 0,
    target: { note: "A4" },
  }

  try {
    const res = await runDrillWithDrivers(
      { drill, settings: baseSettings, profile: baseProfile },
      {
        ensureMicPermission: async () => {
          calls.push("perm")
          return true
        },
        playReferenceForDrill: async () => {
          calls.push("ref:start")
          await Promise.resolve()
          refDone = true
          calls.push("ref:end")
        },
        stopTone: async () => {
          calls.push("tone:stop")
        },
        startMic: async (_cfg: any, onFrame: (frame: { samples: Float32Array }) => void) => {
          calls.push(refDone ? "mic:after_ref" : "mic:before_ref")
          // feed a few frames of A4 to finish quickly
          const sr = 44100
          let phase = 0
          for (let i = 0; i < 40; i++) {
            const f = makeSineFrame(440, sr, 20, phase)
            phase = f.phase
            now += 20
            onFrame({ samples: f.samples })
          }
          return {
            stop: async () => {
              calls.push("mic:stop")
            },
          }
        },
        clock: {
          now: () => now,
          setTimeout: (fn: () => void) => setTimeout(fn, 10),
          clearTimeout: (id: any) => clearTimeout(id),
        },
      },
    )

    assert.equal(calls.includes("mic:before_ref"), false)
    assert.equal(calls.includes("mic:after_ref"), true)
    assert.ok(Number.isFinite(res.score), `expected finite score, got ${res.score}`)
  } finally {
    ;(Date as any).now = realNow
  }
})

test("runDrillWithDrivers: mic permission check is gated (prompt once across runs)", async () => {
  resetPermissionGate()

  let now = 0
  const realNow = Date.now
  ;(Date as any).now = () => now

  let permCalls = 0
  const drill: AnyDrill = {
    id: "d_test2",
    title: "Quick A4",
    type: "match_note",
    level: 1,
    tuneWindowCents: 40,
    holdMs: 60,
    countdownMs: 0,
    target: { note: "A4" },
  }

  const drivers = {
    ensureMicPermission: async () => {
      permCalls += 1
      return true
    },
    startMic: async (_cfg: any, onFrame: any) => {
      const sr = 44100
      let phase = 0
      for (let i = 0; i < 10; i++) {
        const f = makeSineFrame(440, sr, 20, phase)
        phase = f.phase
        now += 20
        onFrame({ samples: f.samples })
      }
      return { stop: async () => {} }
    },
    clock: {
      now: () => now,
      setTimeout: (fn: () => void) => setTimeout(fn, 10),
      clearTimeout: (id: any) => clearTimeout(id),
    },
  } as any

  try {
    await runDrillWithDrivers({ drill, settings: baseSettings, profile: baseProfile }, drivers)
    await runDrillWithDrivers({ drill, settings: baseSettings, profile: baseProfile }, drivers)
    assert.equal(permCalls, 1)
  } finally {
    ;(Date as any).now = realNow
  }
})


test("runDrillWithDrivers: repeatability (same audio frames -> stable score)", async () => {
  resetPermissionGate()

  let now = 0
  const realNow = Date.now
  ;(Date as any).now = () => now

  const drill: AnyDrill = {
    id: "d_repeat",
    title: "A4 Repeat",
    type: "match_note",
    level: 1,
    tuneWindowCents: 35,
    holdMs: 120,
    countdownMs: 0,
    target: { note: "A4" },
  }

  // Generate a deterministic set of frames once and replay them.
  const sr = 44100
  const frames: Float32Array[] = []
  let phase = 0
  for (let i = 0; i < 18; i++) {
    const f = makeSineFrame(440, sr, 20, phase)
    phase = f.phase
    frames.push(f.samples)
  }

  const runOnce = async () => {
    now = 0
    return runDrillWithDrivers(
      { drill, settings: baseSettings, profile: baseProfile },
      {
        ensureMicPermission: async () => true,
        startMic: async (_cfg: any, onFrame: (frame: { samples: Float32Array }) => void) => {
          for (const s of frames) {
            now += 20
            onFrame({ samples: s })
          }
          return { stop: async () => {} }
        },
        clock: {
          now: () => now,
          setTimeout: (fn: () => void) => setTimeout(fn, 10),
          clearTimeout: (id: any) => clearTimeout(id),
        },
      } as any,
    )
  }

  try {
    const a = await runOnce()
    const b = await runOnce()

    // We expect stability: allow tiny variance in case of float rounding.
    const delta = Math.abs(a.score - b.score)
    assert.ok(delta <= 2, `expected score delta <= 2, got ${delta} (a=${a.score}, b=${b.score})`)
  } finally {
    ;(Date as any).now = realNow
  }
})
