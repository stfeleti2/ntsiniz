import { coreError } from '@/core/util/errors'

export type AntiCheatResult = { ok: true } | { ok: false; reason: string }

export function validateCompetitionScore(score: number): AntiCheatResult {
  if (!Number.isFinite(score)) return { ok: false, reason: 'score_not_finite' }
  if (score < 0 || score > 100) return { ok: false, reason: `score_out_of_range:${score}` }
  return { ok: true }
}

export function validateDisplayName(name: string): AntiCheatResult {
  const n = (name ?? '').trim()
  if (!n.length) return { ok: false, reason: 'display_name_empty' }
  if (n.length > 40) return { ok: false, reason: 'display_name_too_long' }
  return { ok: true }
}

export function validateSubmission(input: { score: number; displayName: string; clipId: string }): AntiCheatResult {
  const s = validateCompetitionScore(input.score)
  if (!s.ok) return s
  const dn = validateDisplayName(input.displayName)
  if (!dn.ok) return dn
  if (!input.clipId || input.clipId.length < 6) return { ok: false, reason: 'clip_id_invalid' }
  return { ok: true }
}

export function validateProofMeta(meta?: {
  durationMs?: number
  avgConfidence?: number
  framesAnalyzed?: number
  strictness?: number
  deviceClass?: string
}): AntiCheatResult {
  if (!meta) return { ok: true }
  if (meta.durationMs != null) {
    if (!Number.isFinite(meta.durationMs)) return { ok: false, reason: 'duration_not_finite' }
    if (meta.durationMs < 1000 || meta.durationMs > 10 * 60 * 1000) return { ok: false, reason: 'duration_out_of_range' }
  }
  if (meta.avgConfidence != null) {
    if (!Number.isFinite(meta.avgConfidence)) return { ok: false, reason: 'confidence_not_finite' }
    if (meta.avgConfidence < 0 || meta.avgConfidence > 1) return { ok: false, reason: 'confidence_out_of_range' }
  }
  if (meta.framesAnalyzed != null) {
    if (!Number.isFinite(meta.framesAnalyzed)) return { ok: false, reason: 'frames_not_finite' }
    if (meta.framesAnalyzed < 10 || meta.framesAnalyzed > 2_000_000) return { ok: false, reason: 'frames_out_of_range' }
  }
  if (meta.strictness != null) {
    if (!Number.isFinite(meta.strictness)) return { ok: false, reason: 'strictness_not_finite' }
    if (meta.strictness < 0 || meta.strictness > 1.5) return { ok: false, reason: 'strictness_out_of_range' }
  }
  if (meta.deviceClass != null) {
    const ok = meta.deviceClass === 'low' || meta.deviceClass === 'mid' || meta.deviceClass === 'high' || meta.deviceClass === 'unknown'
    if (!ok) return { ok: false, reason: 'device_class_invalid' }
  }
  return { ok: true }
}

export function reportAntiCheat(reason: string, meta: any): void {
  coreError('competition_anti_cheat', { reason, ...meta })
}
