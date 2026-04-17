import type { Settings } from '@/core/storage/settingsRepo'
import type { CoachingMode, OnboardingIntent } from './types'

export type SingingLevel = NonNullable<Settings['singingLevel']>

export type SingingLevelProfile = {
  level: SingingLevel
  coachingMode: CoachingMode
  onboardingIntent: OnboardingIntent
  helperDensity: NonNullable<Settings['helperDensity']>
  guideTone: NonNullable<Settings['guideTone']>
  routeHint: NonNullable<Settings['routeHint']>
}

const LEVEL_MAP: Record<SingingLevel, SingingLevelProfile> = {
  justStarting: {
    level: 'justStarting',
    coachingMode: 'starter',
    onboardingIntent: 'justStarting',
    helperDensity: 'high',
    guideTone: 'gentle',
    routeHint: 'R1',
  },
  casual: {
    level: 'casual',
    coachingMode: 'casual',
    onboardingIntent: 'justExplore',
    helperDensity: 'balanced',
    guideTone: 'balanced',
    routeHint: 'R3',
  },
  serious: {
    level: 'serious',
    coachingMode: 'practised',
    onboardingIntent: 'moreControl',
    helperDensity: 'balanced',
    guideTone: 'direct',
    routeHint: 'R2',
  },
  professionalCoach: {
    level: 'professionalCoach',
    coachingMode: 'performerCoach',
    onboardingIntent: 'songsBetter',
    helperDensity: 'light',
    guideTone: 'direct',
    routeHint: 'R5',
  },
}

export function profileForSingingLevel(level: SingingLevel): SingingLevelProfile {
  return LEVEL_MAP[level]
}

