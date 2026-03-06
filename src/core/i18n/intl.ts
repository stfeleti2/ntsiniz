import { getLocale, t } from './runtime'

export function formatNumber(value: number, opts?: Intl.NumberFormatOptions) {
  const loc = getLocale()
  try {
    return new Intl.NumberFormat(loc, opts).format(value)
  } catch {
    return String(value)
  }
}

export function formatDate(value: Date | number, opts?: Intl.DateTimeFormatOptions) {
  const loc = getLocale()
  const d = typeof value === 'number' ? new Date(value) : value
  try {
    return new Intl.DateTimeFormat(loc, opts).format(d)
  } catch {
    return d.toISOString()
  }
}

/**
 * Plural-aware lookup.
 * Convention supported:
 * - nested: key.one, key.other
 * - flat: key_one, key_other
 */
export function plural(path: string, count: number, vars?: Record<string, string | number>) {
  const loc = getLocale()
  let rule: Intl.LDMLPluralRule = 'other'
  try {
    rule = new Intl.PluralRules(loc).select(count)
  } catch {
    rule = count === 1 ? 'one' : 'other'
  }
  const nested = `${path}.${rule}`
  const flat = `${path}_${rule}`
  const outNested = t(nested, { ...(vars ?? {}), count })
  if (outNested !== nested) return outNested
  const outFlat = t(flat, { ...(vars ?? {}), count })
  if (outFlat !== flat) return outFlat
  // fallback
  return t(path, { ...(vars ?? {}), count })
}
