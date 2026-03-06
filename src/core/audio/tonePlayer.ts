import * as FileSystem from "expo-file-system/legacy"
import { Audio } from "expo-av"
import { fromByteArray } from "base64-js"
import { fileStore } from "@/core/io/fileStore"
import { audioSession } from "./session"

export type ToneStep = {
  freqHz: number
  durationMs: number
  gapMs?: number
}

let current: Audio.Sound | null = null
const uriCache = new Map<string, string>()

let modeReady = false

let currentFinish: (() => void) | null = null

export async function stopTone() {
  try {
    // resolve any pending "await playback" promises
    currentFinish?.()
    currentFinish = null
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

export async function playToneSequence(steps: ToneStep[], opts?: { volume?: number }) {
  await ensureMode()
  await stopTone()

  const key = steps
    .map((s) => `${Math.round(s.freqHz * 10)}/${Math.round(s.durationMs)}+${Math.round(s.gapMs ?? 0)}`)
    .join("|")

  let uri = uriCache.get(key)
  if (!uri) {
    const wav = wavBytesForSequence(steps, 44100)
    const b64 = fromByteArray(wav)
    uri = `${FileSystem.cacheDirectory}tone_${hash(key)}.wav`
    await fileStore.writeBase64(uri, b64)
    uriCache.set(key, uri)
  }

  const sound = new Audio.Sound()
  await sound.loadAsync({ uri }, { shouldPlay: true, volume: opts?.volume ?? 0.9 })
  current = sound

  // Wait for completion so callers can do true "listen then sing".
  const totalMs = steps.reduce((a, s) => a + s.durationMs + (s.gapMs ?? 0), 0)

  await new Promise<void>((resolve) => {
    let done = false

    const finish = async () => {
      if (done) return
      done = true
      try {
        sound.setOnPlaybackStatusUpdate(null)
      } catch {}

      try {
        // keep cache URI, but release player resources
        await sound.unloadAsync()
      } catch {}

      if (current === sound) current = null
      if (currentFinish) currentFinish = null
      resolve()
    }

    currentFinish = () => {
      void finish()
    }

    sound.setOnPlaybackStatusUpdate((st: any) => {
      if (!st?.isLoaded) return
      if (st.didJustFinish) void finish()
    })

    void sound.playAsync().catch(() => finish())

    // safety timeout (in case status updates fail)
    setTimeout(() => {
      void finish()
    }, totalMs + 600)
  })
}

async function ensureMode() {
  if (modeReady) return
  // Force Audio.setAudioModeAsync to the right settings once, but don't hold a ref.
  await audioSession.enter('tone')
  await audioSession.leave('tone')
  modeReady = true
}

function wavBytesForSequence(steps: ToneStep[], sampleRate: number) {
  // Build float samples
  const floats: number[] = []
  for (const s of steps) {
    const n = Math.max(1, Math.floor((s.durationMs / 1000) * sampleRate))
    const fadeN = Math.min(Math.floor(sampleRate * 0.01), Math.floor(n / 2))
    for (let i = 0; i < n; i++) {
      let amp = 0.22
      if (fadeN > 0) {
        if (i < fadeN) amp *= i / fadeN
        else if (i > n - fadeN) amp *= (n - i) / fadeN
      }
      const t = i / sampleRate
      floats.push(Math.sin(2 * Math.PI * s.freqHz * t) * amp)
    }
    const gapMs = s.gapMs ?? 0
    if (gapMs > 0) {
      const g = Math.floor((gapMs / 1000) * sampleRate)
      for (let i = 0; i < g; i++) floats.push(0)
    }
  }

  // Convert to PCM16
  const pcm = new Uint8Array(floats.length * 2)
  const dv = new DataView(pcm.buffer)
  for (let i = 0; i < floats.length; i++) {
    const v = Math.max(-1, Math.min(1, floats[i]))
    dv.setInt16(i * 2, Math.round(v * 32767), true)
  }

  // WAV header
  const header = new Uint8Array(44)
  const h = new DataView(header.buffer)
  writeStr(h, 0, "RIFF")
  h.setUint32(4, 36 + pcm.byteLength, true)
  writeStr(h, 8, "WAVE")
  writeStr(h, 12, "fmt ")
  h.setUint32(16, 16, true)
  h.setUint16(20, 1, true) // PCM
  h.setUint16(22, 1, true) // mono
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
  // cheap deterministic hash
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16)
}
