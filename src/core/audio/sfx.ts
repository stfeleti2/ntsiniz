import * as FileSystem from "expo-file-system/legacy"
import { fileStore } from "@/core/io/fileStore"
import { Audio } from "expo-av"
import { fromByteArray } from "base64-js"
import { audioSession } from "./session"

export type SfxKind = "pb" | "streak" | "win"

let modeReady = false
let current: Audio.Sound | null = null
const uriCache = new Map<string, string>()

export async function stopSfx() {
  try {
    if (current) {
      await current.stopAsync()
      await current.unloadAsync()
    }
  } catch {
    // ignore
  } finally {
    current = null
  }
}

/**
 * Plays a subtle, short celebration cue. Uses a generated WAV written to cache.
 * Optional (controlled by settings).
 */
export async function playSfx(kind: SfxKind, opts?: { volume?: number }) {
  await ensureMode()
  await audioSession.enter('sfx')
  try {
    await stopSfx()

    const steps = kindToSteps(kind)
    const key = `sfx:${kind}:${steps.map((s) => `${Math.round(s.freqHz)}@${s.durationMs}+${s.gapMs ?? 0}`).join("|")}`

    let uri = uriCache.get(key)
    if (!uri) {
      const wav = wavBytesForSequence(steps, 44100)
      const b64 = fromByteArray(wav)
      const base = (FileSystem as any).cacheDirectory ?? ''
      uri = `${base}sfx_${hash(key)}.wav`
      await fileStore.writeBase64(uri, b64)
      uriCache.set(key, uri)
    }

    const sound = new Audio.Sound()
    await sound.loadAsync({ uri }, { shouldPlay: true, volume: opts?.volume ?? 0.25 })
    current = sound

    sound.setOnPlaybackStatusUpdate((st: any) => {
      if (!st?.isLoaded) return
      if (st.didJustFinish) {
        void (async () => {
          try {
            await sound.unloadAsync()
          } catch {}
          if (current === sound) current = null
        })()
      }
    })

    try {
      await sound.playAsync()
    } catch {
      try {
        await sound.unloadAsync()
      } catch {}
      if (current === sound) current = null
    }
  } finally {
    await audioSession.leave('sfx')
  }
}


type ToneStep = { freqHz: number; durationMs: number; gapMs?: number }

function kindToSteps(kind: SfxKind): ToneStep[] {
  if (kind === "pb") {
    return [
      { freqHz: 784, durationMs: 85, gapMs: 20 },
      { freqHz: 988, durationMs: 120 },
    ]
  }
  if (kind === "streak") {
    return [
      { freqHz: 659, durationMs: 70, gapMs: 15 },
      { freqHz: 784, durationMs: 95 },
    ]
  }
  return [{ freqHz: 740, durationMs: 90 }]
}

async function ensureMode() {
  if (modeReady) return
  // Force Audio.setAudioModeAsync to the right settings once, but don't hold a ref.
  await audioSession.enter('sfx')
  await audioSession.leave('sfx')
  modeReady = true
}

function wavBytesForSequence(steps: ToneStep[], sampleRate: number) {
  const floats: number[] = []
  for (const s of steps) {
    const n = Math.max(1, Math.floor((s.durationMs / 1000) * sampleRate))
    const fadeN = Math.min(Math.floor(sampleRate * 0.01), Math.floor(n / 2))
    for (let i = 0; i < n; i++) {
      let amp = 0.18
      if (fadeN > 0) {
        if (i < fadeN) amp *= i / fadeN
        else if (i > n - fadeN) amp *= (n - i) / fadeN
      }
      const tt = i / sampleRate
      floats.push(Math.sin(2 * Math.PI * s.freqHz * tt) * amp)
    }
    const gapMs = s.gapMs ?? 0
    if (gapMs > 0) {
      const g = Math.floor((gapMs / 1000) * sampleRate)
      for (let i = 0; i < g; i++) floats.push(0)
    }
  }

  const pcm = new Uint8Array(floats.length * 2)
  const dv = new DataView(pcm.buffer)
  for (let i = 0; i < floats.length; i++) {
    const v = Math.max(-1, Math.min(1, floats[i]))
    dv.setInt16(i * 2, Math.round(v * 32767), true)
  }

  const header = new Uint8Array(44)
  const h = new DataView(header.buffer)
  writeStr(h, 0, "RIFF")
  h.setUint32(4, 36 + pcm.byteLength, true)
  writeStr(h, 8, "WAVE")
  writeStr(h, 12, "fmt ")
  h.setUint32(16, 16, true)
  h.setUint16(20, 1, true)
  h.setUint16(22, 1, true)
  h.setUint32(24, sampleRate, true)
  h.setUint32(28, sampleRate * 2, true)
  h.setUint16(32, 2, true)
  h.setUint16(34, 16, true)
  writeStr(h, 36, "data")
  h.setUint32(40, pcm.byteLength, true)

  const out = new Uint8Array(header.byteLength + pcm.byteLength)
  out.set(header, 0)
  out.set(pcm, header.byteLength)
  return out
}

function writeStr(dv: DataView, off: number, s: string) {
  for (let i = 0; i < s.length; i++) dv.setUint8(off + i, s.charCodeAt(i))
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16)
}
