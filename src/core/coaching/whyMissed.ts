import type { Drill } from '@/core/drills/schema'

export type CoachingHint = {
  title: string
  body: string
}

/**
 * Turns numeric metrics into user-friendly "why" explanations.
 * Keep it deterministic + offline (no LLM), tuned to reduce anxiety.
 */
export function explainAttempt(drill: Drill, metrics: any, score: number): CoachingHint[] {
  const m = metrics ?? {}
  const out: CoachingHint[] = []

  const avgAbs = typeof m.avgAbsCents === 'number' ? m.avgAbsCents : null
  const wobble = typeof m.wobbleCents === 'number' ? m.wobbleCents : null
  const lockMs = typeof m.timeToEnterMs === 'number' ? m.timeToEnterMs : null
  const voiced = typeof m.voicedRatio === 'number' ? m.voicedRatio : null

  if (voiced != null && voiced < 0.65) {
    out.push({
      title: 'Voice dropped out',
      body: 'Try a softer onset and steady airflow. If your pitch tracker loses you, sing slightly louder (not strained).',
    })
  }

  if (avgAbs != null && avgAbs > 30) {
    out.push({
      title: 'Pitch was far from center',
      body: 'Aim for the middle of the note. Think: “land, then relax” — not “push up/down.”',
    })
  } else if (avgAbs != null && avgAbs > 22) {
    out.push({
      title: 'Almost there — just tighten accuracy',
      body: 'Do one clean rep focusing only on the first 300ms. Fast lock = higher scores.',
    })
  }

  if (lockMs != null && lockMs > 1400) {
    out.push({
      title: 'Lock time was slow',
      body: 'Before you sing, imagine the note. Start closer — fewer “search” moments.',
    })
  }

  if (wobble != null && wobble > 22) {
    out.push({
      title: 'Pitch wobbled',
      body: 'Hold the vowel steady and keep jaw loose. Reduce “shake” and you’ll climb fast.',
    })
  }

  if (drill.type === 'interval' && typeof m.intervalErrorCents === 'number' && Math.abs(m.intervalErrorCents) > 35) {
    out.push({
      title: 'Interval distance drifted',
      body: 'Sing the destination note in your head first. Then jump cleanly — don’t slide.',
    })
  }

  if (drill.type === 'melody_echo' && typeof m.contourHitRate === 'number' && m.contourHitRate < 0.7) {
    out.push({
      title: 'Melody shape was off',
      body: 'Forget exact cents — first match “up/down” correctly. Then refine pitch.',
    })
  }

  // If score is already strong, keep it short and confidence-building.
  if (score >= 80) {
    return out.slice(0, 2)
  }

  return out.slice(0, 3)
}
