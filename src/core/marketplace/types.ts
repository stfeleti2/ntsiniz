export type MarketplaceCoach = {
  id: string
  name: string
  headline?: string
  bio?: string
  tags?: string[]
  rating?: number
}

export type MarketplaceProgramDay = {
  day: number
  title: string
  lessonId?: string | null
}

export type MarketplaceProgram = {
  id: string
  coachId: string
  title: string
  subtitle?: string
  /** access tier (default: free) */
  access?: 'free' | 'pro'
  /** optional price label (e.g., "R99" or "Pro") */
  priceLabel?: string
  days: MarketplaceProgramDay[]
}

export type CoachesPack = { packId: string; language: string; coaches: MarketplaceCoach[] }
export type ProgramsPack = { packId: string; language: string; programs: MarketplaceProgram[] }

export type Enrollment = {
  id: string
  createdAt: number
  updatedAt: number
  userId: string
  programId: string
  coachId: string
  currentDay: number
  completedDaysJson: string
}

export type FeedbackItem = {
  id: string
  createdAt: number
  updatedAt: number
  coachId: string
  coachName: string
  studentId: string
  studentName: string
  clipId?: string | null
  message: string
  response?: string | null
  status: 'open' | 'done'
}
