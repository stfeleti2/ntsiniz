import { Audio } from 'expo-av'
import { notifyAudioSessionError } from './interruptions'

const AudioAny = Audio as any

export type AudioSessionMode = 'idle' | 'sfx' | 'tone' | 'record' | 'playback'

type ModeConfig = {
  allowsRecordingIOS: boolean
  playsInSilentModeIOS: boolean
  staysActiveInBackground: boolean
  interruptionModeIOS: number
  interruptionModeAndroid: number
  shouldDuckAndroid: boolean
}

const MODE: Record<AudioSessionMode, ModeConfig> = {
  idle: {
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    interruptionModeIOS: AudioAny.InterruptionModeIOS?.DoNotMix ?? 1,
    interruptionModeAndroid: AudioAny.InterruptionModeAndroid?.DoNotMix ?? 1,
    shouldDuckAndroid: true,
  },
  sfx: {
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    interruptionModeIOS: AudioAny.InterruptionModeIOS?.DoNotMix ?? 1,
    interruptionModeAndroid: AudioAny.InterruptionModeAndroid?.DoNotMix ?? 1,
    shouldDuckAndroid: true,
  },
  tone: {
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    interruptionModeIOS: AudioAny.InterruptionModeIOS?.DoNotMix ?? 1,
    interruptionModeAndroid: AudioAny.InterruptionModeAndroid?.DoNotMix ?? 1,
    shouldDuckAndroid: true,
  },
  playback: {
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    interruptionModeIOS: AudioAny.InterruptionModeIOS?.DoNotMix ?? 1,
    interruptionModeAndroid: AudioAny.InterruptionModeAndroid?.DoNotMix ?? 1,
    shouldDuckAndroid: true,
  },
  record: {
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    interruptionModeIOS: AudioAny.InterruptionModeIOS?.DoNotMix ?? 1,
    interruptionModeAndroid: AudioAny.InterruptionModeAndroid?.DoNotMix ?? 1,
    shouldDuckAndroid: true,
  },
}

/**
 * Single owner of Audio.setAudioModeAsync.
 * Prevents different modules from racing/overwriting audio session mode.
 */
class AudioSessionManager {
  private ref: Map<AudioSessionMode, number> = new Map()
  private current: AudioSessionMode = 'idle'
  private applying: Promise<void> | null = null

  async enter(mode: AudioSessionMode): Promise<void> {
    this.ref.set(mode, (this.ref.get(mode) ?? 0) + 1)
    await this.applyBestMode()
  }

  async leave(mode: AudioSessionMode): Promise<void> {
    const n = (this.ref.get(mode) ?? 0) - 1
    if (n <= 0) this.ref.delete(mode)
    else this.ref.set(mode, n)
    await this.applyBestMode()
  }

  getCurrentMode(): AudioSessionMode {
    return this.current
  }

  private desiredMode(): AudioSessionMode {
    // priority order: record > playback > tone > sfx > idle
    if (this.ref.has('record')) return 'record'
    if (this.ref.has('playback')) return 'playback'
    if (this.ref.has('tone')) return 'tone'
    if (this.ref.has('sfx')) return 'sfx'
    return 'idle'
  }

  private async applyBestMode(): Promise<void> {
    const next = this.desiredMode()
    if (next === this.current) return

    // Serialize audio mode changes to avoid races.
    const run = async () => {
      const cfg = MODE[next]
      try {
        await Audio.setAudioModeAsync({
        allowsRecordingIOS: cfg.allowsRecordingIOS,
        playsInSilentModeIOS: cfg.playsInSilentModeIOS,
        staysActiveInBackground: cfg.staysActiveInBackground,
        interruptionModeIOS: cfg.interruptionModeIOS,
        interruptionModeAndroid: cfg.interruptionModeAndroid,
        shouldDuckAndroid: cfg.shouldDuckAndroid,
        })
      } catch (e: any) {
        notifyAudioSessionError(String(e?.message ?? e))
        throw e
      }
      this.current = next
    }
    this.applying = (this.applying ?? Promise.resolve()).then(run, run).finally(() => {
      // keep chain alive but clear pointer to avoid memory leak
      this.applying = null
    })
    await this.applying
  }
}

export const audioSession = new AudioSessionManager()
