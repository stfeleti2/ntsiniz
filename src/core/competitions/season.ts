import type { CompetitionDef, CompetitionRound, CompetitionSeason } from './types'

export function isRoundOpen(round: CompetitionRound, now = Date.now()) {
  return now >= round.opensAt && now < round.closesAt
}

export function getActiveRound(comp: CompetitionDef, now = Date.now()): CompetitionRound | null {
  return comp.rounds.find((r) => isRoundOpen(r, now)) ?? null
}

export function isSeasonActive(season: CompetitionSeason, now = Date.now()) {
  return now >= season.startsAt && now < season.endsAt
}
