import {
  BEGINNER_CENTS_BANDS,
  PRO_CENTS_BANDS,
  STANDARD_CENTS_BANDS,
  bandForCentsError,
  bandScore,
  type CentsBands,
  type FrameBand,
} from './bands'

export type PhraseGradeLabel = 'perfect' | 'clean' | 'almost' | 'tryAgain'

export type PhraseGrade = {
  label: PhraseGradeLabel
  /** 0..1 */
  score: number
  bands: {
    pitch: FrameBand
    stability: FrameBand
    voiced: FrameBand
    timing: FrameBand
  }
  reasonKey: 'sharp' | 'flat' | 'unstable' | 'enterLate' | 'lowVoiced' | 'nice'
  /** compact coaching hint, used in UI */
  cueKey: 'aimUp' | 'aimDown' | 'holdSteady' | 'enterEarlier' | 'singSteadyVowel' | 'keepGoing'
}

export type PhraseGraderOptions = {
  difficulty?: 'beginner' | 'standard' | 'pro'
  /** minimum confidence to consider readings */
  minConfidence?: number
  /** override cents bands */
  bands?: CentsBands
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}

function bandsForDifficulty(d: PhraseGraderOptions['difficulty']): CentsBands {
  if (d === 'beginner') return BEGINNER_CENTS_BANDS
  if (d === 'pro') return PRO_CENTS_BANDS
  return STANDARD_CENTS_BANDS
}

/**
 * Grades a phrase using aggregate metrics.
 *
 * This is designed to work with both drill attempts and performance clips
 * where we typically store summary metrics instead of full per-frame traces.
 */
export function gradePhraseFromMetrics(
  metrics: any,
  opts?: PhraseGraderOptions,
): PhraseGrade {
  const m = metrics ?? {}
  const bands = opts?.bands ?? bandsForDifficulty(opts?.difficulty)

  const avgAbsCents = typeof m.avgAbsCents === 'number' ? Math.abs(m.avgAbsCents) : NaN
  const wobbleCents = typeof m.wobbleCents === 'number' ? Math.abs(m.wobbleCents) : NaN
  const voicedRatio = typeof m.voicedRatio === 'number' ? m.voicedRatio : NaN
  const timeToEnterMs = typeof m.timeToEnterMs === 'number' ? m.timeToEnterMs : NaN
  const confidenceAvg = typeof m.confidenceAvg === 'number' ? m.confidenceAvg : undefined

  // Pitch band
  const pitchBand = bandForCentsError(avgAbsCents, { bands, confidence: confidenceAvg, minConfidence: opts?.minConfidence })

  // Stability band (wobble): treat <= 10c as perfect, <= 18c great, <= 28c good, <= 40 ok.
  const stabilityBands: CentsBands = { perfect: 10, great: 18, good: 28, ok: 40, miss: 9999 }
  const stabilityBand = bandForCentsError(wobbleCents, { bands: stabilityBands, confidence: confidenceAvg, minConfidence: opts?.minConfidence })

  // Voiced band: % of frames that were confidently voiced
  const voicedBand: FrameBand =
    !isFinite(voicedRatio) ? 'noread' : voicedRatio >= 0.82 ? 'perfect' : voicedRatio >= 0.72 ? 'great' : voicedRatio >= 0.6 ? 'good' : voicedRatio >= 0.45 ? 'ok' : 'miss'

  // Timing band: time-to-enter; forgiving because drills differ
  const timingBand: FrameBand =
    !isFinite(timeToEnterMs) ? 'noread' : timeToEnterMs <= 900 ? 'perfect' : timeToEnterMs <= 1400 ? 'great' : timeToEnterMs <= 2200 ? 'good' : timeToEnterMs <= 3200 ? 'ok' : 'miss'

  const pitchScore = bandScore(pitchBand)
  const stabilityScore = bandScore(stabilityBand)
  const voicedScore = bandScore(voicedBand)
  const timingScore = bandScore(timingBand)

  // Weighted, because pitch + stability are the core promise.
  const score = clamp01(pitchScore * 0.45 + stabilityScore * 0.2 + voicedScore * 0.2 + timingScore * 0.15)

  // Labeling: keep it friendly. We only show 4 buckets.
  let label: PhraseGradeLabel = 'almost'
  if (score >= 0.88 && pitchBand !== 'ok' && pitchBand !== 'miss') label = 'perfect'
  else if (score >= 0.74 && pitchBand !== 'miss') label = 'clean'
  else if (score >= 0.55) label = 'almost'
  else label = 'tryAgain'

  // Reason/cue: pick the biggest limiter.
  const limiters: Array<{ k: PhraseGrade['reasonKey']; c: PhraseGrade['cueKey']; s: number } > = []

  // Prefer voiced/timing first when they are very low (breath/entry is actionable and reduces frustration).
  limiters.push({ k: 'lowVoiced', c: 'singSteadyVowel', s: 1 - voicedScore })
  limiters.push({ k: 'enterLate', c: 'enterEarlier', s: 1 - timingScore })
  limiters.push({ k: 'unstable', c: 'holdSteady', s: 1 - stabilityScore })

  // If we have signed cents info, sharpen direction
  const signedAvg = typeof m.avgCents === 'number' ? m.avgCents : undefined
  const direction: 'sharp' | 'flat' | undefined =
    typeof signedAvg === 'number' && isFinite(signedAvg) ? (signedAvg > 6 ? 'sharp' : signedAvg < -6 ? 'flat' : undefined) : undefined

  if (direction === 'sharp') limiters.unshift({ k: 'sharp', c: 'aimDown', s: 1 - pitchScore + 0.15 })
  if (direction === 'flat') limiters.unshift({ k: 'flat', c: 'aimUp', s: 1 - pitchScore + 0.15 })

  limiters.push({ k: 'nice', c: 'keepGoing', s: 0 })
  limiters.sort((a, b) => b.s - a.s)
  const top = limiters[0]

  return {
    label,
    score,
    bands: { pitch: pitchBand, stability: stabilityBand, voiced: voicedBand, timing: timingBand },
    reasonKey: top.k,
    cueKey: top.c,
  }
}
