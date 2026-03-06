export type CompetitionRound = {
  id: string
  title: string
  opensAt: number
  closesAt: number
}

export type CompetitionDef = {
  id: string
  title: string
  subtitle?: string
  rules?: string[]
  rounds: CompetitionRound[]
}

export type CompetitionSeason = {
  id: string
  title: string
  subtitle?: string
  startsAt: number
  endsAt: number
  competitions: CompetitionDef[]
}

export type CompetitionsPack = {
  packId: string
  language: string
  seasons: CompetitionSeason[]
}

export type CompetitionSubmission = {
  id: string
  createdAt: number
  updatedAt: number
  competitionId: string
  roundId: string
  userId: string
  displayName: string
  clipId: string
  score: number
  /** Optional proof metadata for anti-cheat and debugging. */
  durationMs?: number
  avgConfidence?: number
  framesAnalyzed?: number
  strictness?: number
  deviceClass?: 'low' | 'mid' | 'high' | 'unknown'
  notes?: string | null
  source: 'self' | 'import'
  hidden?: boolean
}
