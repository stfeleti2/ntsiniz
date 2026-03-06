/**
 * Optional “real” voice demo clips.
 *
 * These are **local assets** (offline-first). You can replace the wav files
 * in `assets/audio/` with recorded voice clips later.
 */

type AssetRef = number
declare function require(path: string): AssetRef

export const lessonVoiceAssets: Record<string, AssetRef> = {
  lesson_pitch_center: require('../../../assets/audio/lesson_pitch_center.wav'),
  lesson_fast_lock: require('../../../assets/audio/lesson_fast_lock.wav'),
  lesson_hold_steady: require('../../../assets/audio/lesson_hold_steady.wav'),
  lesson_clean_slide: require('../../../assets/audio/lesson_clean_slide.wav'),
  lesson_intervals: require('../../../assets/audio/lesson_intervals.wav'),
  lesson_melody_shape: require('../../../assets/audio/lesson_melody_shape.wav'),
  lesson_week1_check: require('../../../assets/audio/lesson_week1_check.wav'),
  lesson_breath_phrase: require('../../../assets/audio/lesson_breath_phrase.wav'),
  lesson_stability_motion: require('../../../assets/audio/lesson_stability_motion.wav'),
  lesson_agility: require('../../../assets/audio/lesson_agility.wav'),
  lesson_resonance: require('../../../assets/audio/lesson_resonance.wav'),
  lesson_vibrato: require('../../../assets/audio/lesson_vibrato.wav'),
  lesson_intervals_melody: require('../../../assets/audio/lesson_intervals_melody.wav'),
  lesson_week2_check: require('../../../assets/audio/lesson_week2_check.wav'),

  // Marketplace lessons (reusing existing demo clips for now)
  mkt_intro: require('../../../assets/audio/lesson_week1_check.wav'),
}

export function getLessonVoiceAsset(lessonId?: string | null) {
  if (!lessonId) return null
  return lessonVoiceAssets[lessonId] ?? null
}
