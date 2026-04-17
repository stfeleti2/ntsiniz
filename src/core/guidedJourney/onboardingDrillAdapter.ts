import { scoreGuidedAttempt } from './scoringAdapter'

export function evaluateOnboardingFirstDrill(input: {
  snrDb: number
  vadConfidence: number
  clippingRate: number
  silenceRate: number
  voicedRatio: number
  sustainStability: number
  glideSpanMidi: number
  retryCount: number
}) {
  const modeledFamily = input.glideSpanMidi >= 2.8 ? 'pitch_slide' : 'match_note'
  const result = scoreGuidedAttempt({
    drillId: 'onboarding_first_drill',
    packFamily: modeledFamily,
    metrics: {
      drillType: modeledFamily === 'pitch_slide' ? 'slide' : 'match_note',
      avgAbsCents: Math.max(6, Math.min(58, input.sustainStability * 0.92 + (1 - input.vadConfidence) * 36)),
      meanCents: 0,
      wobbleCents: Math.max(4, Math.min(32, input.sustainStability)),
      voicedRatio: input.voicedRatio,
      confidenceAvg: input.vadConfidence,
      timeToEnterMs: Math.max(280, Math.round((1 - input.vadConfidence) * 3000)),
      overshootRate: Math.max(0, Math.min(0.95, input.clippingRate * 1.4 + Math.max(0, input.retryCount - 1) * 0.06)),
      glideMonotonicity: Math.max(0.35, Math.min(1, input.glideSpanMidi / 4.5)),
      glideSmoothness: Math.max(0.25, Math.min(1, 1 - input.sustainStability / 36)),
      driftCentsPerSec: (input.silenceRate - 0.35) * 8,
    } as any,
    masteryThreshold: 68,
  })

  return {
    score: result.finalScore,
    band: result.band,
    coachTip: result.coachTip,
    diagnosisTags: result.diagnosisTags,
    family: modeledFamily,
  }
}

