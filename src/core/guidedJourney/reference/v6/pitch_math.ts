// V6 curriculum pack companion
export const hzToMidi = (hz: number): number => {
  if (!Number.isFinite(hz) || hz <= 0) return NaN;
  return 69 + 12 * Math.log2(hz / 440);
};

export const centsError = (observedHz: number, targetHz: number): number => {
  if (!Number.isFinite(observedHz) || !Number.isFinite(targetHz) || observedHz <= 0 || targetHz <= 0) {
    return NaN;
  }
  return 1200 * Math.log2(observedHz / targetHz);
};

export const absCentsError = (observedHz: number, targetHz: number): number =>
  Math.abs(centsError(observedHz, targetHz));

export const clamp = (value: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, value));

export const frameAccuracy = (absErrorCents: number): number =>
  clamp(1 - Math.pow(absErrorCents / 60, 1.35), 0, 1);

export const mean = (values: number[]): number =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

export const stdDev = (values: number[]): number => {
  if (!values.length) return 0;
  const avg = mean(values);
  const variance = mean(values.map((v) => (v - avg) ** 2));
  return Math.sqrt(variance);
};

export const voicedScore = (voicedRatio: number): number =>
  clamp((voicedRatio - 0.45) / 0.45, 0, 1);

export const confidenceScore = (meanConfidence: number): number =>
  clamp((meanConfidence - 0.45) / 0.5, 0, 1);

export const confidenceCap = (meanConfidence: number): number | null => {
  if (meanConfidence < 0.35) return 45;
  if (meanConfidence < 0.45) return 59;
  return null;
};

export type TuningBand = "perfect" | "good" | "ok" | "poor" | "miss";

export const classifyCents = (absErrorCents: number): TuningBand => {
  if (absErrorCents <= 15) return "perfect";
  if (absErrorCents <= 25) return "good";
  if (absErrorCents <= 40) return "ok";
  if (absErrorCents <= 60) return "poor";
  return "miss";
};