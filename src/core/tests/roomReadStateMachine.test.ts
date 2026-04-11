import test from 'node:test'
import assert from 'node:assert/strict'

import { createRoomReadMachine } from '../audio/roomReadStateMachine'
import type { DspFrameOutput } from '../audio/dsp/types'

test('room read machine reaches first win on stable voiced input', () => {
  const machine = createRoomReadMachine({ startedAtMs: 0 })
  let now = 0
  let snapshot = machine.push(frame(now, baseDsp({ voiced: false, vadProb: 0.05, noiseFloorDb: -44, snrDb: 1 }), null, null, 'built_in|mic'))
  now += 20

  while (now <= 1_600) {
    snapshot = machine.push(frame(now, baseDsp({ voiced: false, vadProb: 0.06, noiseFloorDb: -43.5, snrDb: 1.2 }), null, null, 'built_in|mic'))
    now += 20
  }
  assert.equal(snapshot.state, 'signal_lock')

  for (let i = 0; i < 18; i += 1) {
    snapshot = machine.push(
      frame(
        now,
        baseDsp({ voiced: true, vadProb: 0.78, noiseFloorDb: -43, snrDb: 18 }),
        {
          ts: now,
          freqHz: 220,
          confidence: 0.84,
          note: 'A3',
          cents: 6,
          rms: 0.1,
          voiced: true,
        },
        57,
        'built_in|mic',
      ),
    )
    now += 20
  }
  assert.equal(snapshot.state, 'phrase_capture')

  for (let i = 0; i < 280; i += 1) {
    const cents = i % 5 === 0 ? 8 : 2
    snapshot = machine.push(
      frame(
        now,
        baseDsp({ voiced: true, vadProb: 0.82, noiseFloorDb: -42.8, snrDb: 21 }),
        {
          ts: now,
          freqHz: 246,
          confidence: 0.88,
          note: 'B3',
          cents,
          rms: 0.12,
          voiced: true,
        },
        59,
        'built_in|mic',
      ),
    )
    now += 20
  }
  assert.equal(snapshot.state, 'range_estimate')

  for (let i = 0; i < 96; i += 1) {
    snapshot = machine.push(
      frame(
        now,
        baseDsp({ voiced: true, vadProb: 0.84, noiseFloorDb: -42.5, snrDb: 23 }),
        {
          ts: now,
          freqHz: 261,
          confidence: 0.9,
          note: 'C4',
          cents: 1,
          rms: 0.13,
          voiced: true,
        },
        60,
        'built_in|mic',
      ),
    )
    now += 20
  }

  assert.equal(snapshot.state, 'first_win')
  assert.equal(snapshot.shouldFinalize, true)
  assert.equal(snapshot.issue, null)
})

test('room read machine fails fast in noisy room profile', () => {
  const machine = createRoomReadMachine({ startedAtMs: 0 })
  let now = 0
  let snapshot = machine.push(frame(now, baseDsp({ voiced: false, vadProb: 0.02, noiseFloorDb: -24, snrDb: 0, signalQuality: 'poor' }), null, null, 'built_in|mic'))
  now += 20

  while (now <= 1_560) {
    snapshot = machine.push(frame(now, baseDsp({ voiced: false, vadProb: 0.03, noiseFloorDb: -23, snrDb: 0.5, signalQuality: 'poor' }), null, null, 'built_in|mic'))
    now += 20
  }

  assert.equal(snapshot.state, 'failed')
  assert.equal(snapshot.issue, 'noisyRoom')
  assert.equal(snapshot.shouldStop, true)
})

test('room read machine detects route changes', () => {
  const machine = createRoomReadMachine({ startedAtMs: 0 })
  const first = machine.push(frame(0, baseDsp({}), null, null, 'built_in|mic'))
  assert.notEqual(first.state, 'failed')
  const second = machine.push(frame(20, baseDsp({}), null, null, 'bluetooth|mic'))
  assert.equal(second.state, 'failed')
  assert.equal(second.issue, 'routeChanged')
})

function frame(nowMs: number, dsp: DspFrameOutput, reading: any, midi: number | null, routeFingerprint: string | null) {
  return {
    nowMs,
    dsp,
    reading,
    midi,
    permissionGranted: true,
    routeFingerprint,
  }
}

function baseDsp(partial: Partial<DspFrameOutput>): DspFrameOutput {
  return {
    ts: partial.ts ?? 0,
    rms: partial.rms ?? 0.01,
    peak: partial.peak ?? 0.2,
    vadProb: partial.vadProb ?? 0.2,
    voiced: partial.voiced ?? false,
    noiseFloorDb: partial.noiseFloorDb ?? -40,
    snrDb: partial.snrDb ?? 4,
    clipping: partial.clipping ?? false,
    voicedRatio: partial.voicedRatio ?? 0.1,
    clippingRate: partial.clippingRate ?? 0,
    silenceRate: partial.silenceRate ?? 0.1,
    signalQuality: partial.signalQuality ?? 'good',
    routeHealth: partial.routeHealth ?? 'stable',
  }
}

