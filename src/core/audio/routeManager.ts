import * as AudioRoute from 'ntsiniz-audio-route';

export type RouteInfo = AudioRoute.AudioRouteInfo;
export type RouteType = AudioRoute.AudioRouteType;

export type VocalCapturePreset = {
  allowBluetooth: boolean;
  preferBuiltInMic: boolean;
  preferredSampleRateHz: number;
  preferredIOBufferDurationMs: number;
};

// Defaults tuned for singing + realtime feedback:
// - Prefer 48k where available for better spectral resolution.
// - Use ~10ms IO buffer for responsive feedback without extreme CPU.
export const DEFAULT_VOCAL_PRESET: VocalCapturePreset = {
  allowBluetooth: true,
  preferBuiltInMic: false,
  preferredSampleRateHz: 48000,
  preferredIOBufferDurationMs: 10,
};

export async function configureForVocalCapture(preset: Partial<VocalCapturePreset> = {}): Promise<void> {
  const cfg = { ...DEFAULT_VOCAL_PRESET, ...preset };
  await AudioRoute.configureVocalCapture({
    allowBluetooth: cfg.allowBluetooth,
    preferBuiltInMic: cfg.preferBuiltInMic,
    preferredSampleRateHz: cfg.preferredSampleRateHz,
    preferredIOBufferDurationMs: cfg.preferredIOBufferDurationMs,
  });
}

export async function getCurrentRoute(): Promise<RouteInfo> {
  return AudioRoute.getCurrentRoute();
}

export async function listInputs(): Promise<RouteInfo[]> {
  return AudioRoute.listInputs();
}

export async function setPreferredInput(uid: string | null): Promise<boolean> {
  return AudioRoute.setPreferredInput(uid);
}

export const audioRouteEmitter = AudioRoute.audioRouteEmitter;
