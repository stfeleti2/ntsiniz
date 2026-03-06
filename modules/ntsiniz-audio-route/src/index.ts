import { EventEmitter, requireNativeModule } from 'expo-modules-core';

export type AudioRouteType =
  | 'built_in_mic'
  | 'wired_headset'
  | 'bluetooth_sco'
  | 'bluetooth_a2dp'
  | 'bluetooth_le'
  | 'unknown';

export type AudioRouteInfo = {
  routeType: AudioRouteType;
  inputName?: string;
  inputUid?: string;
  sampleRateHz?: number;
  ioBufferDurationMs?: number;
  channels?: number;
  isInputAvailable?: boolean;
  isBluetoothInput?: boolean;
  // platform raw info (debug only)
  raw?: Record<string, any>;
};

export type VocalCaptureConfig = {
  allowBluetooth?: boolean;
  preferBuiltInMic?: boolean;
  preferredSampleRateHz?: number; // 44100 or 48000
  preferredIOBufferDurationMs?: number; // e.g. 5-10ms for feedback, higher for quality
};

type NativeModuleType = {
  getCurrentRoute(): Promise<AudioRouteInfo>;
  listInputs(): Promise<AudioRouteInfo[]>;
  setPreferredInput(uid: string | null): Promise<boolean>;
  configureVocalCapture(config: VocalCaptureConfig): Promise<void>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
};

const FALLBACK_ROUTE: AudioRouteInfo = {
  routeType: 'unknown',
  inputName: '',
  inputUid: '',
  sampleRateHz: 44100,
  ioBufferDurationMs: 10,
  channels: 1,
  isInputAvailable: false,
  isBluetoothInput: false,
};

let Native: NativeModuleType | null = null;
try {
  Native = requireNativeModule<NativeModuleType>('NtsinizAudioRoute');
} catch {
  Native = null;
}

export const audioRouteEmitter: { addListener: (eventName: string, listener: (payload: any) => void) => { remove: () => void } } =
  Native
    ? (new EventEmitter(Native as any) as any)
    : {
        addListener() {
          return { remove: () => {} };
        },
      };

export async function getCurrentRoute(): Promise<AudioRouteInfo> {
  if (!Native) return FALLBACK_ROUTE;
  return Native.getCurrentRoute();
}

export async function listInputs(): Promise<AudioRouteInfo[]> {
  if (!Native) return [];
  return Native.listInputs();
}

export async function setPreferredInput(uid: string | null): Promise<boolean> {
  if (!Native) return false;
  return Native.setPreferredInput(uid);
}

export async function configureVocalCapture(config: VocalCaptureConfig): Promise<void> {
  if (!Native) return;
  return Native.configureVocalCapture(config);
}
