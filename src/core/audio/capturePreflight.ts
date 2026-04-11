import type { Settings } from '@/core/storage/settingsRepo'
import { getMicPermissionState, requestMicPermission, type MicPermissionState } from './micStream'
import { configureForVocalCapture, getCurrentRoute, setPreferredInput, type RouteInfo } from './routeManager'

export type CapturePreflightResult = {
  permissionGranted: boolean
  permissionState: MicPermissionState
  route: RouteInfo | null
  routeStabilityScore: number
  stable: boolean
  preferredSampleRate: number
}

export async function runCapturePreflight(settings: Settings, opts?: { stabilityWindowMs?: number }): Promise<CapturePreflightResult> {
  const permissionState = await resolvePermissionState(settings)
  const permissionGranted = permissionState === 'granted'
  if (!permissionGranted) {
    return {
      permissionGranted: false,
      permissionState,
      route: null,
      routeStabilityScore: 0,
      stable: false,
      preferredSampleRate: 48000,
    }
  }

  await configureForVocalCapture({
    allowBluetooth: settings.allowBluetoothMic ?? true,
    preferBuiltInMic: settings.preferBuiltInMic ?? false,
    preferredSampleRateHz: 48000,
    preferredIOBufferDurationMs: 10,
  }).catch(() => {})

  if (settings.preferredInputUid) {
    await setPreferredInput(settings.preferredInputUid).catch(() => {})
  }

  const windowMs = Math.max(240, opts?.stabilityWindowMs ?? 620)
  const pollEveryMs = 120
  const startedAt = Date.now()

  let route = await getCurrentRoute().catch(() => null)
  let previousFingerprint = routeFingerprint(route)
  let changes = 0
  while (Date.now() - startedAt < windowMs) {
    await sleep(pollEveryMs)
    const next = await getCurrentRoute().catch(() => null)
    const nextFingerprint = routeFingerprint(next)
    if (previousFingerprint && nextFingerprint && previousFingerprint !== nextFingerprint) {
      changes += 1
    }
    if (nextFingerprint) previousFingerprint = nextFingerprint
    route = next ?? route
  }

  const routeStabilityScore = clamp01(1 - changes * 0.34)
  const preferredSampleRate =
    route?.sampleRateHz && route.sampleRateHz >= 32000
      ? Math.round(route.sampleRateHz)
      : settings.preferredSampleRate && settings.preferredSampleRate >= 32000
        ? Math.round(settings.preferredSampleRate)
        : 48000

  return {
    permissionGranted: true,
    permissionState: 'granted',
    route,
    routeStabilityScore,
    stable: routeStabilityScore >= 0.62,
    preferredSampleRate,
  }
}

async function resolvePermissionState(settings: Settings): Promise<MicPermissionState> {
  if (settings.qaBypassMicPermission) return 'granted'
  const initial = await getMicPermissionState().catch(() => 'error' as const)
  if (initial === 'granted' || initial === 'blocked') return initial
  return await requestMicPermission().catch(() => 'error' as const)
}

function routeFingerprint(route: RouteInfo | null) {
  if (!route) return null
  return `${route.routeType}|${route.inputUid ?? ''}|${route.sampleRateHz ?? ''}|${route.channels ?? ''}`
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}
