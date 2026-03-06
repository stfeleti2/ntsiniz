import type { RootStackParamList } from './types'

export type SurfaceFlags = {
  storeBuild: boolean
  cloudOn: boolean
  socialOn: boolean
  invitesOn: boolean
  duetsOn: boolean
  competitionsOn: boolean
  marketplaceOn: boolean
  diagnosticsOn: boolean
  dev: boolean
}

const CORE_STACK_SCREENS: Array<keyof RootStackParamList> = [
  'Welcome',
  'Calibration',
  'Onboarding',
  'MainTabs',
  'Tuner',
  'MicTest',
  'Drill',
  'DrillResult',
  'Results',
  'Playback',
  'RecoveredTakes',
  'CurriculumOverview',
  'CurriculumDayPreview',
  'DayComplete',
  'Billing',
  'Privacy',
  'Paywall',
  'SessionSummary',
  'WeeklyReport',
  'PitchLockChallenge',
]

export function getEnabledStackScreenNames(flags: SurfaceFlags): string[] {
  const names = [...CORE_STACK_SCREENS] as string[]

  if (flags.dev) {
    names.push('Billing', 'PermissionsPrimer', 'Privacy')
  }

  if (!flags.storeBuild) {
    names.push('Missions', 'AdminContent')
  }

  if (flags.socialOn) {
    names.push('ChallengesHub', 'Leaderboard', 'Friends', 'ImportCode', 'CreatePost', 'PostDetail', 'Account', 'SignIn', 'CreatorProfile')
  }
  if (flags.invitesOn) names.push('Invite')
  if (flags.cloudOn) names.push('SyncStatus')

  if (flags.duetsOn) {
    names.push('DuetsHub', 'DuetCreate', 'DuetImport', 'DuetSession')
  }

  if (flags.competitionsOn) {
    names.push('CompetitionsHub', 'CompetitionDetail', 'CompetitionSubmit', 'CompetitionLeaderboard')
  }

  if (flags.marketplaceOn) {
    names.push('Marketplace', 'ProgramDetail', 'ProgramDayComplete', 'FeedbackInbox', 'FeedbackDetail', 'FeedbackImport', 'CoachTools')
  }

  return names
}
