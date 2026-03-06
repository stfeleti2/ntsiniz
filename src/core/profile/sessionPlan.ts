import type { DrillPack } from "../drills/schema"

export type SessionPlan = {
  sessionId: string
  drillIds: string[]
  index: number
  failStreakByDrill: Record<string, number>
}

const plans = new Map<string, SessionPlan>()

export function createSessionPlan(sessionId: string, pack: DrillPack, firstDrillId: string): SessionPlan {
  const cycle = ["match_note", "sustain", "slide", "interval", "melody_echo"] as const
  const findType = (id: string) => pack.drills.find((d) => d.id === id)?.type

  const firstType = findType(firstDrillId) ?? "match_note"
  const idx = cycle.indexOf(firstType as any)

  const pickNextType = (step: number) => cycle[(idx + step) % cycle.length]

  const pickDrillByType = (type: string, fallback: string) => pack.drills.find((d) => d.type === type)?.id ?? fallback

  const d1 = firstDrillId
  const d2 = pickDrillByType(pickNextType(1), d1)
  const d3 = pickDrillByType(pickNextType(2), d2)

  const plan: SessionPlan = { sessionId, drillIds: [d1, d2, d3], index: 0, failStreakByDrill: {} }
  plans.set(sessionId, plan)
  return plan
}

/**
 * Create a plan from an explicit list of drill ids (used by Curriculum + Daily Challenge).
 */
export function createSessionPlanFromIds(sessionId: string, drillIds: string[]): SessionPlan {
  const uniq: string[] = []
  for (const id of drillIds) {
    if (typeof id !== 'string') continue
    if (uniq.includes(id)) continue
    uniq.push(id)
  }
  const plan: SessionPlan = { sessionId, drillIds: uniq.length ? uniq : [], index: 0, failStreakByDrill: {} }
  plans.set(sessionId, plan)
  return plan
}

export function getPlan(sessionId: string): SessionPlan | null {
  return plans.get(sessionId) ?? null
}

export function advancePlan(sessionId: string) {
  const p = plans.get(sessionId)
  if (!p) return null
  p.index += 1
  return p
}

export function markFail(sessionId: string, drillId: string) {
  const p = plans.get(sessionId)
  if (!p) return
  p.failStreakByDrill[drillId] = (p.failStreakByDrill[drillId] ?? 0) + 1
}

export function resetFail(sessionId: string, drillId: string) {
  const p = plans.get(sessionId)
  if (!p) return
  p.failStreakByDrill[drillId] = 0
}

export function dropPlan(sessionId: string) {
  plans.delete(sessionId)
}
