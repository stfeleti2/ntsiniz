import { exec, getDb } from '@/core/storage/db'
import { id as makeId } from '@/core/util/id'

/**
 * Trust-by-default: record security/privacy-relevant actions locally.
 *
 * Rules:
 * - Payload is allowlisted per event kind (schema-like).
 * - No free-form PII; obvious PII keys are rejected.
 * - Keep payloads small (short strings only).
 */

export type AuditEvent = {
  kind:
    | 'telemetry.consent'
    | 'share.create'
    | 'share.open'
    | 'share.expire'
    | 'cloud.signin'
    | 'cloud.signout'
    | 'cloud.sync'
    | 'moderation.report'
  entityKind?: string
  entityId?: string
  payload?: Record<string, any>
}

const FORBIDDEN_KEYS = new Set(['email', 'token', 'authorization', 'password', 'passcode', 'phone', 'address'])

const ALLOWED_KEYS_BY_KIND: Record<AuditEvent['kind'], string[]> = {
  'telemetry.consent': ['decision', 'source', 'version'],
  'share.create': ['shareKind', 'expiresAt', 'mode', 'scope'],
  'share.open': ['shareKind', 'mode', 'scope'],
  'share.expire': ['shareKind', 'reason'],
  'cloud.signin': ['provider', 'method'],
  'cloud.signout': ['provider'],
  'cloud.sync': ['direction', 'items', 'durationMs', 'ok'],
  'moderation.report': ['entityKind', 'reason', 'status'],
}

export async function audit(e: AuditEvent): Promise<void> {
  const d = await getDb()
  const now = Date.now()
  const row = {
    id: makeId('audit'),
    createdAt: now,
    kind: e.kind,
    entityKind: e.entityKind ?? null,
    entityId: e.entityId ?? null,
    payload: JSON.stringify(scrubPayload(e.kind, e.payload ?? {})),
  }

  await exec(
    d,
    `INSERT INTO audit_events (id, createdAt, kind, entityKind, entityId, payload) VALUES (?, ?, ?, ?, ?, ?);`,
    [row.id, row.createdAt, row.kind, row.entityKind, row.entityId, row.payload],
  )
}

function scrubPayload(kind: AuditEvent['kind'], p: Record<string, any>) {
  const allowed = new Set(ALLOWED_KEYS_BY_KIND[kind] ?? [])
  const out: Record<string, any> = {}

  for (const [k, v] of Object.entries(p ?? {})) {
    if (!allowed.has(k)) continue
    if (FORBIDDEN_KEYS.has(k.toLowerCase())) continue
    if (v == null) continue
    if (typeof v === 'number' || typeof v === 'boolean') out[k] = v
    else if (typeof v === 'string') out[k] = v.slice(0, 80)
    else if (typeof v === 'object') out[k] = '[object]'
  }

  return out
}
