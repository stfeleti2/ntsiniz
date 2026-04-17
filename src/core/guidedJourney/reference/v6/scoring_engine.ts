// V6 curriculum pack companion
import {
  absCentsError,
  clamp,
  confidenceCap,
  confidenceScore,
  frameAccuracy,
  mean,
  stdDev,
  voicedScore
} from "./pitch_math";

export interface PitchFrame {
  timestampMs: number;
  observedHz: number;
  smoothedHz: number;
  targetHz: number;
  voiced: boolean;
  rms: number;
  pitchConfidence: number;
  isReferencePlayback?: boolean;
  isRecoveryState?: boolean;
}

export interface DrillScoringConfig {
  family: string;
  passThreshold: number;
  targetHoldMs?: number;
}

export interface AttemptResult {
  finalScore: number;
  passed: boolean;
  band: "excellent" | "pass_strong" | "pass" | "near_pass" | "needs_help" | "retry";
  metrics: Record<string, number>;
  diagnosisTags: string[];
}

const bandFromScore = (score: number): AttemptResult["band"] => {
  if (score >= 90) return "excellent";
  if (score >= 80) return "pass_strong";
  if (score >= 70) return "pass";
  if (score >= 60) return "near_pass";
  if (score >= 45) return "needs_help";
  return "retry";
};

const validFrames = (frames: PitchFrame[]): PitchFrame[] =>
  frames.filter(
    (frame) =>
      frame.voiced &&
      frame.pitchConfidence >= 0.45 &&
      !frame.isReferencePlayback &&
      !frame.isRecoveryState
  );

export const scoreSustainHold = (
  frames: PitchFrame[],
  config: DrillScoringConfig
): AttemptResult => {
  const usable = validFrames(frames);
  const absErrors = usable.map((f) => absCentsError(f.smoothedHz, f.targetHz)).filter(Number.isFinite);
  const accuracies = absErrors.map(frameAccuracy);

  const meanAbs = mean(absErrors);
  const stability = clamp(1 - stdDev(absErrors) / 35, 0, 1);
  const heldDurationMs = usable.length * 20; // assumes 20 ms frames
  const targetHoldMs = config.targetHoldMs ?? 3000;
  const hold = clamp(heldDurationMs / targetHoldMs, 0, 1);
  const zone = clamp(
    usable.filter((f) => absCentsError(f.smoothedHz, f.targetHz) <= 25).length * 20 / targetHoldMs,
    0,
    1
  );
  const voicedRatioMetric = voicedScore(usable.length / Math.max(frames.length, 1));
  const meanConfidence = mean(usable.map((f) => f.pitchConfidence));
  const confidenceMetric = confidenceScore(meanConfidence);

  const raw =
    0.25 * mean(accuracies) +
    0.30 * stability +
    0.25 * hold +
    0.10 * zone +
    0.10 * voicedRatioMetric;

  let finalScore = Math.round(raw * 100);
  const cap = confidenceCap(meanConfidence);
  if (cap !== null) finalScore = Math.min(finalScore, cap);
  if (heldDurationMs < targetHoldMs * 0.5) finalScore = Math.min(finalScore, 64);
  if (usable.length / Math.max(frames.length, 1) < 0.4) finalScore = Math.min(finalScore, 54);

  return {
    finalScore,
    passed: finalScore >= config.passThreshold,
    band: bandFromScore(finalScore),
    metrics: {
      meanAbsCents: meanAbs,
      stabilityStdDevCents: stdDev(absErrors),
      heldDurationMs,
      targetHoldMs,
      meanConfidence,
      confidenceMetric
    },
    diagnosisTags: []
  };
};