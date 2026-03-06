function normalize(v: string): number[] {
  // Accept semver-ish strings like "1.2.3" or "1.2.3-beta".
  const main = v.trim().split('-')[0] ?? ''
  const parts = main.split('.').map((p) => {
    const n = Number.parseInt(p.replace(/[^0-9]/g, ''), 10)
    return Number.isFinite(n) ? n : 0
  })
  while (parts.length < 3) parts.push(0)
  return parts.slice(0, 3)
}

/**
 * Compare semver-ish versions.
 * Returns -1 if a<b, 0 if equal, 1 if a>b.
 */
export function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const aa = normalize(a)
  const bb = normalize(b)
  for (let i = 0; i < 3; i++) {
    if (aa[i] < bb[i]) return -1
    if (aa[i] > bb[i]) return 1
  }
  return 0
}

export function isVersionInRange(opts: { version: string; min?: string | null; max?: string | null }): boolean {
  const { version, min, max } = opts
  if (min && compareVersions(version, min) === -1) return false
  if (max && compareVersions(version, max) === 1) return false
  return true
}
