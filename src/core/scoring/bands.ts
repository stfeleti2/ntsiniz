export type FrameBand = 'perfect' | 'great' | 'good' | 'ok' | 'miss' | 'noread'

/**
 * Research-informed cents bands for perceptual grading.
 *
 * Default tuning is calibrated for "standard" difficulty.
 *
 * - ~15c feels "locked" for most users.
 * - 25c aligns with skilled average error ranges.
 * - 40–50c approaches the "noticeably out of tune" region in many contexts.
 */
export type CentsBands = {
  perfect: number
  great: number
  good: number
  ok: number
  miss: number
}

export const STANDARD_CENTS_BANDS: CentsBands = {
  perfect: 15,
  great: 25,
  good: 40,
  ok: 50,
  miss: 9999,
}

export const BEGINNER_CENTS_BANDS: CentsBands = {
  perfect: 25,
  great: 35,
  good: 50,
  ok: 60,
  miss: 9999,
}

export const PRO_CENTS_BANDS: CentsBands = {
  perfect: 10,
  great: 18,
  good: 30,
  ok: 35,
  miss: 9999,
}

export function bandForCentsError(
  absCents: number,
  opts?: { bands?: CentsBands; confidence?: number; minConfidence?: number },
): FrameBand {
  const confidence = opts?.confidence
  const minConfidence = opts?.minConfidence ?? 0.55
  if (typeof confidence === 'number' && confidence < minConfidence) return 'noread'

  const b = opts?.bands ?? STANDARD_CENTS_BANDS
  if (!isFinite(absCents)) return 'noread'
  if (absCents <= b.perfect) return 'perfect'
  if (absCents <= b.great) return 'great'
  if (absCents <= b.good) return 'good'
  if (absCents <= b.ok) return 'ok'
  return 'miss'
}

export function bandScore(band: FrameBand): number {
  switch (band) {
    case 'perfect':
      return 1.0
    case 'great':
      return 0.85
    case 'good':
      return 0.7
    case 'ok':
      return 0.5
    case 'miss':
      return 0.0
    case 'noread':
    default:
      return 0.0
  }
}
