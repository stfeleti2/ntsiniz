import { getLocale } from '@/core/i18n'
import { tryLoadContentJson } from '@/core/content/loadWithManifest'
import { isLessonDisabled, isPackDisabled } from '@/core/config/flags'
import { coreError } from '@/core/util/errors'
import type { FeedbackPlan } from '@/core/coaching/feedbackPolicy'

export type MicroLesson = {
  id: string
  title: string
  body: string
  /** Optional demo tone steps (hz/duration). Kept schema-light for offline. */
  demo?: { note: string; durationMs: number; gapMs?: number }[]

  /** Deeper coaching (optional). */
  keyPoints?: string[]
  doThis?: string[]
  avoidThis?: string[]
  coachScript?: string[]

  /** Optional authored metadata used for track policies + curriculum. */
  meta?: {
    week?: number
    day?: number
    focus?: string
    difficulty?: string
    durationMin?: number
    feedbackPlan?: FeedbackPlan
    drillIds?: string[]
  }
}

export type LessonPack = {
  packId: string
  language: string
  lessons: MicroLesson[]
}

function parseMeta(raw: any): MicroLesson['meta'] | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const week = typeof raw.week === 'number' ? raw.week : undefined
  const day = typeof raw.day === 'number' ? raw.day : undefined
  const focus = typeof raw.focus === 'string' ? raw.focus : undefined
  const difficulty = typeof raw.difficulty === 'string' ? raw.difficulty : undefined
  const durationMin = typeof raw.durationMin === 'number' ? raw.durationMin : undefined

  const fp = raw.feedbackPlan && typeof raw.feedbackPlan === 'object' ? raw.feedbackPlan : undefined
  const feedbackPlan: FeedbackPlan | undefined =
    fp && typeof fp.mode === 'string' && typeof fp.bandwidthCents === 'number'
      ? {
          mode: fp.mode as any,
          bandwidthCents: fp.bandwidthCents,
          fadeAfterSec: typeof fp.fadeAfterSec === 'number' ? fp.fadeAfterSec : undefined,
        }
      : undefined

  const drillIds = Array.isArray(raw.drillIds) ? raw.drillIds.filter((x: any) => typeof x === 'string') : undefined

  return { week, day, focus, difficulty, durationMin, feedbackPlan, drillIds }
}

export function loadPhase1Lessons(): LessonPack {
  const locale = (getLocale() || 'en').split('-')[0]
  const raw =
    tryLoadContentJson<any>(`lessons/phase1.${locale}.json`) ??
    tryLoadContentJson<any>('lessons/phase1.en.json')

  if (!raw || typeof raw !== 'object') throw new Error('Invalid lesson pack')
  if (typeof raw.packId !== 'string' || typeof raw.language !== 'string' || !Array.isArray(raw.lessons)) {
    throw new Error('Invalid lesson pack')
  }

  if (isPackDisabled(raw.packId)) {
    coreError('pack_disabled', { packId: raw.packId })
    if (!__DEV__) throw new Error(`Pack disabled: ${raw.packId}`)
  }

  return {
    packId: raw.packId,
    language: raw.language,
    lessons: raw.lessons
      .filter((l: any) => l && typeof l.id === 'string' && typeof l.title === 'string')
      .filter((l: any) => {
        const id = String(l.id)
        if (!id) return false
        if (isLessonDisabled(id)) {
          coreError('lesson_disabled', { lessonId: id })
          return __DEV__
        }
        return true
      })
      .map((l: any) => ({
        id: l.id,
        title: l.title,
        body: typeof l.body === 'string' ? l.body : '',
        keyPoints: Array.isArray(l.keyPoints) ? l.keyPoints.filter((x: any) => typeof x === 'string') : undefined,
        doThis: Array.isArray(l.doThis) ? l.doThis.filter((x: any) => typeof x === 'string') : undefined,
        avoidThis: Array.isArray(l.avoidThis) ? l.avoidThis.filter((x: any) => typeof x === 'string') : undefined,
        coachScript: Array.isArray(l.coachScript) ? l.coachScript.filter((x: any) => typeof x === 'string') : undefined,
        demo: Array.isArray(l.demo)
          ? l.demo
              .filter((x: any) => x && typeof x.note === 'string' && typeof x.durationMs === 'number')
              .map((x: any) => ({ note: x.note, durationMs: x.durationMs, gapMs: typeof x.gapMs === 'number' ? x.gapMs : undefined }))
          : undefined,
        meta: parseMeta((l as any).meta),
      })),
  }
}

export function loadMarketplaceLessons(): LessonPack {
  const locale = (getLocale() || 'en').split('-')[0]
  const raw =
    tryLoadContentJson<any>(`lessons/marketplace.${locale}.json`) ??
    tryLoadContentJson<any>('lessons/marketplace.en.json')

  if (!raw || typeof raw !== 'object') throw new Error('Invalid lesson pack')
  if (typeof raw.packId !== 'string' || typeof raw.language !== 'string' || !Array.isArray(raw.lessons)) {
    throw new Error('Invalid lesson pack')
  }

  if (isPackDisabled(raw.packId)) {
    coreError('pack_disabled', { packId: raw.packId })
    if (!__DEV__) throw new Error(`Pack disabled: ${raw.packId}`)
  }

  return {
    packId: raw.packId,
    language: raw.language,
    lessons: raw.lessons
      .filter((l: any) => l && typeof l.id === 'string' && typeof l.title === 'string')
      .filter((l: any) => {
        const id = String(l.id)
        if (!id) return false
        if (isLessonDisabled(id)) {
          coreError('lesson_disabled', { lessonId: id })
          return __DEV__
        }
        return true
      })
      .map((l: any) => ({
        id: l.id,
        title: l.title,
        body: typeof l.body === 'string' ? l.body : '',
        keyPoints: Array.isArray(l.keyPoints) ? l.keyPoints.filter((x: any) => typeof x === 'string') : undefined,
        doThis: Array.isArray(l.doThis) ? l.doThis.filter((x: any) => typeof x === 'string') : undefined,
        avoidThis: Array.isArray(l.avoidThis) ? l.avoidThis.filter((x: any) => typeof x === 'string') : undefined,
        coachScript: Array.isArray(l.coachScript) ? l.coachScript.filter((x: any) => typeof x === 'string') : undefined,
        demo: Array.isArray(l.demo)
          ? l.demo
              .filter((x: any) => x && typeof x.note === 'string' && typeof x.durationMs === 'number')
              .map((x: any) => ({ note: x.note, durationMs: x.durationMs, gapMs: typeof x.gapMs === 'number' ? x.gapMs : undefined }))
          : undefined,
        meta: parseMeta((l as any).meta),
      })),
  }
}

export function loadAllLessons(): LessonPack {
  const phase1 = loadPhase1Lessons()
  const marketplace = loadMarketplaceLessons()
  return {
    packId: `${phase1.packId}+${marketplace.packId}`,
    language: phase1.language,
    lessons: [...phase1.lessons, ...marketplace.lessons],
  }
}

export type TrainingTrack = 'beginner' | 'intermediate' | 'advanced'

export function findLesson(pack: LessonPack, lessonId?: string | null): MicroLesson | null {
  if (!lessonId) return null
  return pack.lessons.find((l) => l.id === lessonId) ?? null
}


export function loadProRegimenLessons(): LessonPack {
  const locale = (getLocale() || 'en').split('-')[0]
  const raw =
    tryLoadContentJson<any>(`lessons/pro_regimen.${locale}.json`) ??
    tryLoadContentJson<any>('lessons/pro_regimen.en.json')

  if (!raw || typeof raw !== 'object') throw new Error('Invalid lesson pack')
  if (typeof raw.packId !== 'string' || typeof raw.language !== 'string' || !Array.isArray(raw.lessons)) {
    throw new Error('Invalid lesson pack')
  }

  if (isPackDisabled(raw.packId)) {
    coreError('pack_disabled', { packId: raw.packId })
    if (!__DEV__) throw new Error(`Pack disabled: ${raw.packId}`)
  }

  return {
    packId: raw.packId,
    language: raw.language,
    lessons: raw.lessons
      .filter((l: any) => l && typeof l.id === 'string' && typeof l.title === 'string')
      .filter((l: any) => {
        const id = String(l.id)
        if (!id) return false
        if (isLessonDisabled(id)) {
          coreError('lesson_disabled', { lessonId: id })
          return __DEV__
        }
        return true
      })
      .map((l: any) => ({
        id: l.id,
        title: l.title,
        body: typeof l.body === 'string' ? l.body : '',
        keyPoints: Array.isArray(l.keyPoints) ? l.keyPoints.filter((x: any) => typeof x === 'string') : undefined,
        doThis: Array.isArray(l.doThis) ? l.doThis.filter((x: any) => typeof x === 'string') : undefined,
        avoidThis: Array.isArray(l.avoidThis) ? l.avoidThis.filter((x: any) => typeof x === 'string') : undefined,
        coachScript: Array.isArray(l.coachScript) ? l.coachScript.filter((x: any) => typeof x === 'string') : undefined,
        demo: Array.isArray(l.demo)
          ? l.demo
              .filter((x: any) => x && typeof x.note === 'string' && typeof x.durationMs === 'number')
              .map((x: any) => ({ note: x.note, durationMs: x.durationMs, gapMs: typeof x.gapMs === 'number' ? x.gapMs : undefined }))
          : undefined,
        meta: parseMeta((l as any).meta),
      })),
  }
}

export function loadProRegimen12Lessons(track: TrainingTrack): LessonPack {
  const locale = (getLocale() || 'en').split('-')[0]
  const base = `lessons/pro_regimen12_${track}`
  const raw = tryLoadContentJson<any>(`${base}.${locale}.json`) ?? tryLoadContentJson<any>(`${base}.en.json`)

  if (!raw || typeof raw !== 'object') throw new Error('Invalid lesson pack')
  if (typeof raw.packId !== 'string' || typeof raw.language !== 'string' || !Array.isArray(raw.lessons)) {
    throw new Error('Invalid lesson pack')
  }

  if (isPackDisabled(raw.packId)) {
    coreError('pack_disabled', { packId: raw.packId })
    if (!__DEV__) throw new Error(`Pack disabled: ${raw.packId}`)
  }

  return {
    packId: raw.packId,
    language: raw.language,
    lessons: raw.lessons
      .filter((l: any) => l && typeof l.id === 'string' && typeof l.title === 'string')
      .filter((l: any) => {
        const id = String(l.id)
        if (!id) return false
        if (isLessonDisabled(id)) {
          coreError('lesson_disabled', { lessonId: id })
          return __DEV__
        }
        return true
      })
      .map((l: any) => ({
        id: l.id,
        title: l.title,
        body: typeof l.body === 'string' ? l.body : '',
        keyPoints: Array.isArray(l.keyPoints) ? l.keyPoints.filter((x: any) => typeof x === 'string') : undefined,
        doThis: Array.isArray(l.doThis) ? l.doThis.filter((x: any) => typeof x === 'string') : undefined,
        avoidThis: Array.isArray(l.avoidThis) ? l.avoidThis.filter((x: any) => typeof x === 'string') : undefined,
        coachScript: Array.isArray(l.coachScript) ? l.coachScript.filter((x: any) => typeof x === 'string') : undefined,
        demo: Array.isArray(l.demo)
          ? l.demo
              .filter((x: any) => x && typeof x.note === 'string' && typeof x.durationMs === 'number')
              .map((x: any) => ({ note: x.note, durationMs: x.durationMs, gapMs: typeof x.gapMs === 'number' ? x.gapMs : undefined }))
          : undefined,
        meta: parseMeta((l as any).meta),
      })),
  }
}
