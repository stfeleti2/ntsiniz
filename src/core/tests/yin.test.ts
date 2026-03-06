import test from "node:test"
import assert from "node:assert/strict"
import { yinDetect } from "../pitch/yin.js"

function sine(freq: number, sampleRate: number, n: number) {
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) out[i] = Math.sin((2 * Math.PI * freq * i) / sampleRate)
  return out
}

function addNoise(x: Float32Array, amp = 0.02) {
  const out = new Float32Array(x.length)
  for (let i = 0; i < x.length; i++) out[i] = x[i] + (Math.random() * 2 - 1) * amp
  return out
}

test("yinDetect 220Hz", () => {
  const sr = 16000
  const x = addNoise(sine(220, sr, 2048), 0.01)
  const r = yinDetect(x, sr)
  assert.ok(r.freqHz != null)
  assert.ok(Math.abs(r.freqHz! - 220) < 3)
  assert.ok(r.confidence > 0.6)
})

test("yinDetect 440Hz", () => {
  const sr = 16000
  const x = addNoise(sine(440, sr, 2048), 0.01)
  const r = yinDetect(x, sr)
  assert.ok(r.freqHz != null)
  assert.ok(Math.abs(r.freqHz! - 440) < 5)
  assert.ok(r.confidence > 0.6)
})
