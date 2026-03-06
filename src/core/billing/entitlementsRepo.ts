import { getDb, exec, query } from '@/core/storage/db'

export type Entitlements = {
  /** local-only pro toggle (used when RevenueCat isn't configured) */
  pro?: boolean
  /** when the current pro access expires (ms). null/undefined = no expiry */
  proUntilMs?: number | null
  /** where the value came from */
  source?: 'local' | 'revenuecat'
  /** last time we synced from RevenueCat (ms) */
  syncedAtMs?: number | null
}

const DEFAULT_ENTITLEMENTS: Entitlements = { pro: false, proUntilMs: null, source: 'local', syncedAtMs: null }

type Listener = (e: Entitlements) => void
const listeners = new Set<Listener>()

export function subscribeEntitlements(fn: Listener) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function notify(e: Entitlements) {
  for (const fn of listeners) {
    try {
      fn(e)
    } catch {
      // ignore
    }
  }
}

function safeParseMerge<T extends Record<string, any>>(v: any, fallback: T): T {
  try {
    const obj = typeof v === 'string' ? JSON.parse(v) : v
    if (!obj || typeof obj !== 'object') return fallback
    return { ...fallback, ...obj }
  } catch {
    return fallback
  }
}

export async function getEntitlements(): Promise<Entitlements> {
  const d = await getDb()
  const rows = await query<any>(d, `SELECT * FROM entitlements WHERE id = 'default' LIMIT 1;`)
  if (!rows[0]) return DEFAULT_ENTITLEMENTS
  return safeParseMerge(rows[0].data, DEFAULT_ENTITLEMENTS)
}

export async function upsertEntitlements(e: Entitlements) {
  const d = await getDb()
  await exec(
    d,
    `INSERT INTO entitlements (id, data) VALUES ('default', ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data;`,
    [JSON.stringify(e)],
  )
}

/**
 * Replace entitlements atomically.
 * Prefer this over calling upsertEntitlements directly so we can enforce invariants.
 */
export async function setEntitlements(e: Entitlements) {
  // Normalize: if pro is false, ignore proUntil.
  const normalized: Entitlements = {
    ...DEFAULT_ENTITLEMENTS,
    ...e,
  }
  if (!normalized.pro) normalized.proUntilMs = null
  await upsertEntitlements(normalized)
  notify(normalized)
}

export async function setProEnabled(enabled: boolean) {
  const e = await getEntitlements()
  e.pro = !!enabled
  e.proUntilMs = null
  await setEntitlements(e)
}

export async function hasPro(): Promise<boolean> {
  const e = await getEntitlements()
  if (e.proUntilMs && Date.now() > e.proUntilMs) return false
  return !!e.pro
}

import type { CustomerInfo } from 'react-native-purchases'

export async function setEntitlementsFromRevenueCat(info: CustomerInfo, entitlementId: string) {
  const ent = (info as any)?.entitlements?.active?.[entitlementId]
  const pro = Boolean(ent)
  const until = ent?.expiresDate ? new Date(ent.expiresDate).getTime() : null
  await setEntitlements({ pro, proUntilMs: until, source: 'revenuecat', syncedAtMs: Date.now() })
}
