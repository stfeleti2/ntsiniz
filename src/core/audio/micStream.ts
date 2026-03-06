import {
  requestPermission,
  start,
  stop,
  addFrameListener,
  addErrorListener,
  type AudioFrameEvent,
} from "expo-stream-audio"

export type MicConfig = {
  sampleRate: number
  frameDurationMs: number
}

export type MicHandle = {
  stop: () => Promise<void>
}

export async function ensureMicPermission(): Promise<boolean> {
  const res: any = await requestPermission()
  return res === "granted" || res?.status === "granted"
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
