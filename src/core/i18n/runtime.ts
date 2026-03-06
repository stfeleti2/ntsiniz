import { en } from './en'
import { zu } from './zu'
import { xh } from './xh'

type Dict = typeof en

type MissingKeyInfo = {
  key: string
  locale: string
  at: number
}

let missingKeySink: ((info: MissingKeyInfo) => void) | null = null

let locale = 'en'
let dict: Dict = en

function deepMerge<T extends Record<string, any>>(base: T, override: Record<string, any>): T {
  const out: any = Array.isArray(base) ? [...base] : { ...base }
  for (const k of Object.keys(override)) {
    const bv = (base as any)[k]
    const ov = (override as any)[k]
    if (bv && typeof bv === 'object' && !Array.isArray(bv) && ov && typeof ov === 'object' && !Array.isArray(ov)) {
      out[k] = deepMerge(bv, ov)
    } else {
      out[k] = ov
    }
  }
  return out
}

export function getLocale() {
  return locale
}

export function setLocale(next: string) {
  locale = next || 'en'
  if (locale.startsWith('zu')) dict = deepMerge(en, zu as any)
  else if (locale.startsWith('xh')) dict = deepMerge(en, xh as any)
  else dict = en
}

/**
 * Optional production-safe hook: apps can wire this to telemetry.
 * Must remain non-PII (only key + locale).
 */
export function setMissingKeySink(fn: ((info: MissingKeyInfo) => void) | null) {
  missingKeySink = fn
}

export function t(path: string, vars?: Record<string, string | number>): string
export function t(path: string, fallback?: string, vars?: Record<string, string | number>): string
export function t(path: string, varsOrFallback?: Record<string, string | number> | string, maybeVars?: Record<string, string | number>): string {
  const parts = path.split('.')
  let cur: any = dict
  for (const p of parts) {
    cur = cur?.[p]
  }
  const hit = typeof cur === 'string'
  if (!hit) {
    try {
      missingKeySink?.({ key: path, locale, at: Date.now() })
    } catch {
      // ignore
    }
  }

  const fallback = typeof varsOrFallback === 'string' ? varsOrFallback : undefined
  const vars = typeof varsOrFallback === 'string' ? maybeVars : varsOrFallback
  const base = hit ? cur : fallback ?? path
  if (!vars) return base
  return base.replace(/\{(\w+)\}/g, (_m: string, key: string) => {
    const v = vars[key]
    return v == null ? `{${key}}` : String(v)
  })
}
