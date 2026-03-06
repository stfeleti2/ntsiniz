import { isoDate, startOfDay } from '@/core/curriculum/progress'
import { getSettings, upsertSettings } from '@/core/storage/settingsRepo'

const TOTAL_DAYS = 7
const DAY_MS = 24 * 60 * 60 * 1000

export type PitchLockChallengeDay = {
  day: number
  completedAt: number | null
  bestScore: number | null
  completedDate: string | null
}

export type PitchLockChallengeState = {
  startedAt: number
  days: PitchLockChallengeDay[]
}

function clampDay(day: number) {
  if (!Number.isFinite(day)) return 1
  return Math.max(1, Math.min(TOTAL_DAYS, Math.floor(day)))
}

function makeInitialState(now = Date.now()): PitchLockChallengeState {
  return {
    startedAt: startOfDay(now),
    days: Array.from({ length: TOTAL_DAYS }, (_, i) => ({
      day: i + 1,
      completedAt: null,
      bestScore: null,
      completedDate: null,
    })),
  }
}

function normalizeState(raw: unknown, now = Date.now()): PitchLockChallengeState {
  if (!raw || typeof raw !== 'object') return makeInitialState(now)
  const candidate = raw as Partial<PitchLockChallengeState>
  const startedAt = typeof candidate.startedAt === 'number' ? startOfDay(candidate.startedAt) : startOfDay(now)
  const days = Array.from({ length: TOTAL_DAYS }, (_, i) => {
    const row = (candidate.days ?? [])[i] as Partial<PitchLockChallengeDay> | undefined
    const score = typeof row?.bestScore === 'number' ? Math.round(row.bestScore) : null
    return {
      day: i + 1,
      completedAt: typeof row?.completedAt === 'number' ? row.completedAt : null,
      bestScore: score,
      completedDate: typeof row?.completedDate === 'string' ? row.completedDate : null,
    }
  })
  return { startedAt, days }
}

async function saveState(state: PitchLockChallengeState) {
  const s = await getSettings()
  await upsertSettings({ ...s, pitchLockChallenge: state })
  return state
}

export async function getChallengeState(now = Date.now()): Promise<PitchLockChallengeState> {
  const s = await getSettings()
  const next = normalizeState(s.pitchLockChallenge, now)
  if (!s.pitchLockChallenge) await upsertSettings({ ...s, pitchLockChallenge: next })
  return next
}

export function getTodayChallengeDay(state: PitchLockChallengeState, now = Date.now()): number {
  const elapsedDays = Math.floor((startOfDay(now) - startOfDay(state.startedAt)) / DAY_MS)
  return clampDay(elapsedDays + 1)
}

export async function completeChallengeDay(day: number, score: number, now = Date.now()): Promise<PitchLockChallengeState> {
  const current = await getChallengeState(now)
  const idx = clampDay(day) - 1
  const prev = current.days[idx]
  const nextScore = typeof prev.bestScore === 'number' ? Math.max(prev.bestScore, Math.round(score)) : Math.round(score)
  const updated: PitchLockChallengeState = {
    ...current,
    days: current.days.map((d, i) =>
      i !== idx
        ? d
        : {
            ...d,
            completedAt: prev.completedAt ?? now,
            bestScore: nextScore,
            completedDate: prev.completedDate ?? isoDate(now),
          },
    ),
  }
  return saveState(updated)
}

export async function resetChallenge(now = Date.now()): Promise<PitchLockChallengeState> {
  return saveState(makeInitialState(now))
}
