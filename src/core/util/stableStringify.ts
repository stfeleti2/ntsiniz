export function stableStringify(value: any): string {
  return JSON.stringify(sortValue(value))
}

function sortValue(v: any): any {
  if (Array.isArray(v)) return v.map(sortValue)
  if (v && typeof v === 'object') {
    const out: Record<string, any> = {}
    for (const k of Object.keys(v).sort()) out[k] = sortValue(v[k])
    return out
  }
  return v
}
