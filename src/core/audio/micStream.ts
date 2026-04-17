import {
  start,
  stop,
  addFrameListener,
  addErrorListener,
  type AudioFrameEvent,
} from "expo-stream-audio"
import { Audio } from 'expo-av'

export type MicConfig = {
  sampleRate: number
  frameDurationMs: number
}

export type MicHandle = {
  stop: () => Promise<void>
}

export type MicPermissionState = 'notRequested' | 'granted' | 'denied' | 'blocked' | 'error'

type PermissionLike = {
  granted: boolean
  canAskAgain?: boolean
  status?: string
}

export async function getMicPermissionState(): Promise<MicPermissionState> {
  try {
    const permission = (await Audio.getPermissionsAsync()) as PermissionLike
    if (permission.granted) return 'granted'
    if (permission.status === 'undetermined') return 'notRequested'
    if (permission.canAskAgain === false) return 'blocked'
    return 'denied'
  } catch {
    return 'error'
  }
}

export async function requestMicPermission(): Promise<MicPermissionState> {
  try {
    const permission = (await Audio.requestPermissionsAsync()) as PermissionLike
    if (permission.granted) return 'granted'
    if (permission.canAskAgain === false) return 'blocked'
    return 'denied'
  } catch {
    return 'error'
  }
}

export async function ensureMicPermission(): Promise<boolean> {
  const current = await getMicPermissionState()
  if (current === 'granted') return true
  if (current === 'blocked') return false
  const next = await requestMicPermission()
  return next === 'granted'
}

export async function startMic(cfg: MicConfig, onFrame: (ev: AudioFrameEvent) => void, onError?: (msg: string) => void): Promise<MicHandle> {
  const frameSub: any = addFrameListener(onFrame)
  const errorSub: any = addErrorListener((e: any) => onError?.(e?.message ?? String(e)))

  await start({
    sampleRate: cfg.sampleRate,
    frameDurationMs: cfg.frameDurationMs,
    enableLevelMeter: true,
    enableBackground: false,
  })

  return {
    stop: async () => {
      frameSub?.remove?.()
      errorSub?.remove?.()
      await stop()
    },
  }
}
