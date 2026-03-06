import Constants from 'expo-constants'
import { getRemoteConfig } from './remoteConfig'

let remoteFlagsCache: Record<string, boolean> | null = null
let disabledPackIdsCache: Set<string> | null = null
let disabledDrillIdsCache: Set<string> | null = null
let disabledLessonIdsCache: Set<string> | null = null
let disabledCompetitionIdsCache: Set<string> | null = null
let requireManifestSignatureCache: boolean | null = null
let minManifestSchemaCache: number | null = null
let minAppVersionCache: string | null = null
let maxAppVersionCache: string | null = null

export async function primeRemoteFlags(): Promise<void> {
  const rc = await getRemoteConfig()
  remoteFlagsCache = (rc.flags ?? null) as any
  const disabled = rc.killSwitch?.disabledPackIds ?? []
  disabledPackIdsCache = new Set(disabled)

  const disabledDrills = rc.killSwitch?.disabledDrillIds ?? []
  disabledDrillIdsCache = new Set(disabledDrills)

  const disabledLessons = rc.killSwitch?.disabledLessonIds ?? []
  disabledLessonIdsCache = new Set(disabledLessons)

  const disabledComps = rc.killSwitch?.disabledCompetitionIds ?? []
  disabledCompetitionIdsCache = new Set(disabledComps)

  requireManifestSignatureCache = rc.security?.requireManifestSignature ?? null
  minManifestSchemaCache = (typeof rc.compat?.minManifestSchema === 'number' ? rc.compat?.minManifestSchema : null) as any

  minAppVersionCache = (typeof rc.compat?.minAppVersion === 'string' ? rc.compat?.minAppVersion : null) as any
  maxAppVersionCache = (typeof rc.compat?.maxAppVersion === 'string' ? rc.compat?.maxAppVersion : null) as any
}

function remoteFlag(key: string): boolean | undefined {
  return remoteFlagsCache ? remoteFlagsCache[key] : undefined
}

export function isPackDisabled(packId: string): boolean {
  return !!disabledPackIdsCache?.has(packId)
}

export function isDrillDisabled(drillId: string): boolean {
  return !!disabledDrillIdsCache?.has(drillId)
}

export function isLessonDisabled(lessonId: string): boolean {
  return !!disabledLessonIdsCache?.has(lessonId)
}

export function isCompetitionDisabled(competitionId: string): boolean {
  return !!disabledCompetitionIdsCache?.has(competitionId)
}

export function getDisabledPackIds(): string[] {
  return disabledPackIdsCache ? Array.from(disabledPackIdsCache) : []
}

export function getDisabledDrillIds(): string[] {
  return disabledDrillIdsCache ? Array.from(disabledDrillIdsCache) : []
}

export function getDisabledLessonIds(): string[] {
  return disabledLessonIdsCache ? Array.from(disabledLessonIdsCache) : []
}

export function getDisabledCompetitionIds(): string[] {
  return disabledCompetitionIdsCache ? Array.from(disabledCompetitionIdsCache) : []
}

export function requireManifestSignature(): boolean {
  // Security-ish policy:
  // - In production store builds, signature verification is ALWAYS required.
  // - Remote config may only tighten (turn ON), never loosen.
  const base = !__DEV__ && isStoreBuild()
  if (base) return true

  if (requireManifestSignatureCache === true) return true
  if (requireManifestSignatureCache === false) return false

  // Non-store builds default to OFF unless explicitly enabled.
  return false
}

export function minManifestSchema(): number | null {
  const base = null
  const rc = minManifestSchemaCache
  if (typeof rc === 'number') return base == null ? rc : Math.max(base, rc)
  return base
}

export function minAppVersion(): string | null {
  return minAppVersionCache
}

export function maxAppVersion(): string | null {
  return maxAppVersionCache
}

function getExtra(): Record<string, any> {
  const cfg: any = (Constants as any).expoConfig ?? (Constants as any).manifest ?? (Constants as any).manifest2
  return (cfg?.extra ?? {}) as Record<string, any>
}

function toCamel(s: string) {
  return s
    .toLowerCase()
    .split('_')
    .map((p, i) => (i === 0 ? p : p.slice(0, 1).toUpperCase() + p.slice(1)))
    .join('')
}

function getBoolean(name: string, opts?: { default?: boolean }): boolean {
  const env = (process.env[name] ?? '').toLowerCase()
  if (env === 'true') return true
  if (env === 'false') return false

  const extra = getExtra()
  const v = String(extra[name] ?? extra[toCamel(name)] ?? '').toLowerCase()
  if (v === 'true') return true
  if (v === 'false') return false

  return opts?.default ?? false
}

/**
 * Store-build surface flag.
 * - When true, only ship the core Phase 1 surfaces (no unfinished tabs/screens).
 * - Configure via EAS env or app.config.ts extra: STORE_BUILD=true.
 */
export function isStoreBuild(): boolean {
  // Prefer explicit env in native builds; fall back to expo extra.
  const env = (process.env.STORE_BUILD ?? '').toLowerCase()
  if (env === 'true') return true
  if (env === 'false') return false
  const extra = getExtra()
  const v = String(extra.storeBuild ?? '').toLowerCase()
  return v === 'true'
}

/**
 * Enable Skia rendering for gameplay overlays (Ghost Guide / Waveforms).
 *
 * Defaults:
 * - Enabled in dev (so we can profile).
 * - Disabled in production unless explicitly enabled via env/extra.
 */
export function useSkiaOverlays(): boolean {
  const env = (process.env.USE_SKIA_OVERLAY ?? '').toLowerCase()
  if (env === 'true') return true
  if (env === 'false') return false
  const extra = getExtra()
  const v = String(extra.useSkiaOverlay ?? '').toLowerCase()
  if (v === 'true') return true
  if (v === 'false') return false
  return !!__DEV__
}

/**
 * Low-end mode disables expensive visuals that can cause frame drops.
 */
export function isLowEndMode(): boolean {
  const env = (process.env.LOW_END_MODE ?? '').toLowerCase()
  if (env === 'true') return true
  if (env === 'false') return false
  const extra = getExtra()
  const v = String(extra.lowEndMode ?? '').toLowerCase()
  return v === 'true'
}

/**
 * Feature kill-switches.
 *
 * Defaults:
 * - Store builds: OFF (ship Phase 1 only).
 * - Non-store builds: ON for internal dogfooding, unless explicitly disabled.
 */
export function enableCloud(): boolean {
  const o = remoteFlag('cloud')
  if (o != null) return o
  return getBoolean('ENABLE_CLOUD', { default: !isStoreBuild() })
}

export function enableSocial(): boolean {
  const o = remoteFlag('social')
  if (o != null) return o
  return getBoolean('ENABLE_SOCIAL', { default: !isStoreBuild() })
}

export function enableInvites(): boolean {
  return getBoolean('ENABLE_INVITES', { default: !isStoreBuild() })
}

export function enableDuets(): boolean {
  const o = remoteFlag('duets')
  if (o != null) return o
  return getBoolean('ENABLE_DUETS', { default: !isStoreBuild() })
}

export function enableCompetitions(): boolean {
  const o = remoteFlag('competitions')
  if (o != null) return o
  return getBoolean('ENABLE_COMPETITIONS', { default: !isStoreBuild() })
}

export function enableMarketplace(): boolean {
  const o = remoteFlag('marketplace')
  if (o != null) return o
  return getBoolean('ENABLE_MARKETPLACE', { default: !isStoreBuild() })
}

/**
 * QA-only diagnostics surface.
 * OFF by default in store builds.
 */
export function enableDiagnostics(): boolean {
  return getBoolean('ENABLE_DIAGNOSTICS', { default: __DEV__ })
}
