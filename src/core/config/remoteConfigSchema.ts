import { coreError } from '@/core/util/errors'

export type RemoteKillSwitch = {
  disabledPackIds?: string[]
  disabledDrillIds?: string[]
  disabledLessonIds?: string[]
  disabledCompetitionIds?: string[]
}

export type RemoteCompat = {
  /** Minimum app version allowed to load content (semver-like string, e.g. 1.2.3). */
  minAppVersion?: string
  /** Maximum app version allowed to load content (semver-like string). */
  maxAppVersion?: string
  /** Minimum manifest schema required by remote config. */
  minManifestSchema?: number
}

export type RemoteSecurity = {
  /** When true, production builds must verify content manifest signature before loading content. */
  requireManifestSignature?: boolean
}

export type RemoteConfigPayload = {
  flags?: Record<string, boolean>
  scoring?: Record<string, any>
  packs?: Record<string, any>
  killSwitch?: RemoteKillSwitch
  compat?: RemoteCompat
  security?: RemoteSecurity
}

function isPlainObject(v: any): v is Record<string, any> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function coerceBoolRecord(v: any): Record<string, boolean> | undefined {
  if (v == null) return undefined
  if (!isPlainObject(v)) return undefined
  const out: Record<string, boolean> = {}
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === 'boolean') out[k] = val
  }
  return out
}

function coerceStringArray(v: any): string[] | undefined {
  if (v == null) return undefined
  if (!Array.isArray(v)) return undefined
  const out = v.filter((x) => typeof x === 'string') as string[]
  return out
}

function coerceSemverString(v: any): string | undefined {
  if (typeof v !== 'string') return undefined
  const s = v.trim()
  // very small guard; we don't want to reject valid semver-like tags
  if (!s) return undefined
  return s
}

function coerceNumber(v: any): number | undefined {
  if (typeof v !== 'number') return undefined
  if (!Number.isFinite(v)) return undefined
  return v
}

export function validateRemoteConfig(input: any): { ok: true; value: RemoteConfigPayload } | { ok: false; reason: string } {
  if (input == null) return { ok: true, value: {} }
  if (!isPlainObject(input)) return { ok: false, reason: 'not_object' }

  const flags = coerceBoolRecord((input as any).flags)
  const scoring = isPlainObject((input as any).scoring) ? ((input as any).scoring as Record<string, any>) : undefined
  const packs = isPlainObject((input as any).packs) ? ((input as any).packs as Record<string, any>) : undefined

  let killSwitch: RemoteKillSwitch | undefined
  if ((input as any).killSwitch != null) {
    if (!isPlainObject((input as any).killSwitch)) return { ok: false, reason: 'killSwitch_not_object' }
    killSwitch = {
      disabledPackIds: coerceStringArray((input as any).killSwitch.disabledPackIds),
      disabledDrillIds: coerceStringArray((input as any).killSwitch.disabledDrillIds),
      disabledLessonIds: coerceStringArray((input as any).killSwitch.disabledLessonIds),
      disabledCompetitionIds: coerceStringArray((input as any).killSwitch.disabledCompetitionIds),
    }
  }

  let compat: RemoteCompat | undefined
  if ((input as any).compat != null) {
    if (!isPlainObject((input as any).compat)) return { ok: false, reason: 'compat_not_object' }
    compat = {
      minAppVersion: coerceSemverString((input as any).compat.minAppVersion),
      maxAppVersion: coerceSemverString((input as any).compat.maxAppVersion),
      minManifestSchema: coerceNumber((input as any).compat.minManifestSchema),
    }
  }

  let security: RemoteSecurity | undefined
  if ((input as any).security != null) {
    if (!isPlainObject((input as any).security)) return { ok: false, reason: 'security_not_object' }
    const req = (input as any).security.requireManifestSignature
    security = {
      requireManifestSignature: typeof req === 'boolean' ? req : undefined,
    }
  }

  return { ok: true, value: { flags, scoring, packs, killSwitch, compat, security } }
}

export function safeValidateRemoteConfig(input: any): RemoteConfigPayload {
  const v = validateRemoteConfig(input)
  if (v.ok) return v.value
  coreError('remote_config_invalid', { reason: v.reason })
  return {}
}
