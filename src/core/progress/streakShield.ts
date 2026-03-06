import { getUserState, upsertUserState } from '@/core/storage/userStateRepo'

function startOfDay(ts: number) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export type StreakShieldStatus = {
  available: boolean
  canApplyForYesterday: boolean
  yesterdayKey: number
}

export async function getStreakShieldStatus(now = Date.now()): Promise<StreakShieldStatus> {
  const st = await getUserState()
  const used = st.streakShield?.usedDayKeys ?? []
  const lastUsedAt = st.streakShield?.lastUsedAt ?? 0

  const yesterdayKey = startOfDay(now - 86400000)
  const alreadyShielded = used.includes(yesterdayKey)
  const daysSinceUsed = lastUsedAt ? (startOfDay(now) - startOfDay(lastUsedAt)) / 86400000 : 999

  const available = daysSinceUsed >= 7
  return {
    available,
    canApplyForYesterday: available && !alreadyShielded,
    yesterdayKey,
  }
}

export async function applyShieldForDay(dayKey: number, now = Date.now()) {
  const st = await getUserState()
  const shield = st.streakShield ?? { usedDayKeys: [] }
  if (!shield.usedDayKeys.includes(dayKey)) shield.usedDayKeys = [...shield.usedDayKeys, dayKey]
  shield.lastUsedAt = now
  st.streakShield = shield
  await upsertUserState(st)
}

export async function getShieldedDayKeys(): Promise<number[]> {
  const st = await getUserState()
  return st.streakShield?.usedDayKeys ?? []
}
