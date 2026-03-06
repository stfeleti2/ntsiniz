import type { Drill } from "@/core/drills/schema"

export type MainTabParamList = {
  Home: undefined
  Session:
    | {
        focusType?: Drill["type"]
        missionId?: string
        curriculumDayId?: string
        dailyChallenge?: boolean
        weeklyChallengeId?: string
      }
    | undefined
  Journey: undefined
  Community: undefined
  Settings: undefined
}

export type RootStackParamList = {
  Welcome: undefined
  Calibration: undefined
  Onboarding: undefined
  MainTabs: undefined
  Tuner: undefined
  Drill: { sessionId: string; drillId: string }
  DrillResult: { sessionId: string; drillId: string; attemptId: string; nextDrillId?: string; endToResults?: boolean }
  Results: { sessionId: string }
  Playback: { attemptId: string }
  CurriculumOverview: undefined
  CurriculumDayPreview: { dayId: string }
  DayComplete: { sessionId: string; completedDayId: string }

  ChallengesHub: undefined
  Leaderboard: { period: 'daily' | 'weekly'; challengeId: string }
  Friends: undefined
  ImportCode: { code?: string } | undefined
  CreatePost: undefined
  PostDetail: { postId: string }
  PerformanceMode: { templateId?: string } | undefined
  PerformancePreview: { clipId: string }

  Account: undefined
  SignIn: undefined
  ComponentLab: undefined

  // EPIC 14
  DuetsHub: undefined
  DuetCreate: undefined
  DuetImport: undefined
  DuetSession: { duetId: string }

  // EPIC 16
  Marketplace: undefined
  ProgramDetail: { programId: string }
  ProgramDayComplete: { programId: string; day: number }
  FeedbackInbox: undefined
  FeedbackDetail: { feedbackId: string }
  FeedbackImport: undefined
  CoachTools: { coachId?: string } | undefined

  // EPIC 17
  CompetitionsHub: undefined
  CompetitionDetail: { seasonId: string; competitionId: string }
  CompetitionSubmit: { seasonId: string; competitionId: string; roundId: string }
  CompetitionLeaderboard: { competitionId: string; roundId: string }

  // EPIC 18
  ModTools: undefined
  ReportDetail: { reportId: string }

  // Polish
  Billing: undefined
  Missions: undefined
  AdminContent: undefined

  // Recovery
  RecoveredTakes: undefined

  // Phase 4/5
  Invite: { code?: string } | undefined
  CreatorProfile: { authorId: string; authorName?: string }
  SyncStatus: undefined

  // Production polish
  PermissionsPrimer: { kind: 'mic' | 'camera'; next?: { name: string; params?: any } } | undefined
  Privacy: undefined
  Terms: undefined

  MicTest: undefined

  // Premium
  Paywall: { reason?: string } | undefined

  // Dev
  DevRepeatability: undefined

  // QA (optional)
  Diagnostics: undefined

  // Phase 8
  AudioTortureLab: undefined
  SessionSummary: { sessionId: string }

  // Growth / proof
  WeeklyReport: undefined
  PitchLockChallenge: undefined
}
