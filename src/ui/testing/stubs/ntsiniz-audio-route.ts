export type AudioRouteType = 'built_in' | 'wired' | 'bluetooth' | 'unknown'

export type AudioRouteInfo = {
  routeType: AudioRouteType
  inputName?: string
  inputUid?: string | null
  sampleRateHz?: number
  ioBufferDurationMs?: number
  channels?: number
  isBluetoothInput?: boolean
}

export async function configureVocalCapture(_cfg: any): Promise<void> {}

export async function getCurrentRoute(): Promise<AudioRouteInfo> {
  return { routeType: 'unknown', inputUid: null, inputName: 'Mock input' }
}

export async function listInputs(): Promise<AudioRouteInfo[]> {
  return [await getCurrentRoute()]
}

export async function setPreferredInput(_uid: string | null): Promise<boolean> {
  return true
}

export const audioRouteEmitter = {
  addListener: (_event: string, _fn: (...args: any[]) => void) => ({ remove: () => {} }),
}
