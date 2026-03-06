import type { Drill } from '@/core/drills/schema'

/**
 * Tiny “what now?” rule engine.
 * Given an attempt's metrics, recommend a micro-fix drill.
 */
export function recommendFixDrillId(metrics: any, score?: number): string | null {
  const m = metrics ?? {}

  // If they didn’t sing/voice consistently → breath/voicing.
  if (typeof m.voicedRatio === 'number' && m.voicedRatio < 0.55) return 'breath_phrase_4s'

  // Slow to lock pitch → pitch lock.
  if (typeof m.timeToEnterMs === 'number' && m.timeToEnterMs > 1800) return 'match_c4_lock'

  // High wobble → straight tone control.
  if (typeof m.wobbleCents === 'number' && m.wobbleCents > 35) return 'vibrato_control_hold'

  // Drift → sustain stability.
  if (typeof m.driftCentsPerSec === 'number' && Math.abs(m.driftCentsPerSec) > 10) return 'sustain_a3_steady'

  // Accuracy low → match note.
  if (typeof m.avgAbsCents === 'number' && m.avgAbsCents > 45) return 'match_c4_lock'

  // Drill-type specific hints.
  if (m.drillType === 'interval' && typeof m.intervalErrorCents === 'number' && Math.abs(m.intervalErrorCents) > 35) return 'interval_m3_up'
  if (m.drillType === 'melody_echo') {
    if (typeof m.melodyHitRate === 'number' && m.melodyHitRate < 0.55) return 'melody_echo_3note'
    if (typeof m.contourHitRate === 'number' && m.contourHitRate < 0.65) return 'song_phrase_scale_up'
  }
  if (m.drillType === 'slide' && typeof m.glideSmoothness === 'number' && m.glideSmoothness < 0.6) return 'slide_c4_to_e4'

  // If score is low but nothing obvious, recommend a gentle warmup.
  if (typeof score === 'number' && score < 60) return 'warmup_hum_c4'
  return null
}

export function describeFix(drill: Drill | null): { title: string; body: string } | null {
  if (!drill) return null
  return {
    title: 'Do this now (30s)',
    body: `Quick reset: ${drill.title}. One clean take beats 5 rushed takes.`,
  }
}
