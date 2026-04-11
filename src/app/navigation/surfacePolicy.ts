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
  karaokeOn: boolean
  performanceOn: boolean
  dev: boolean
}

const CORE_STACK_SCREENS: Array<keyof RootStackParamList> = [
  'Welcome',
  'Calibration',
  'Onboarding',
  'PermissionsPrimer',
  'WakeYourVoice',
  'FirstWinResult',
  'Recovery',
  'MainTabs',
  'Tuner',
  'MicTest',
  'Drill',
  'DrillResult',
  'Results',
  'Playback',
  'RecoveredTakes',
  'CurriculumOverview',
  'StageAssessment',
  'CurriculumDayPreview',
  'LessonIntro',
  'ConceptExplainer',
  'TechniqueHelp',
  'WhyThisMatters',
  'DrillPrep',
  'DayComplete',
  'Billing',
  'Privacy',
  'Paywall',
  'SessionSummary',
  'WeeklyReport',
  'PitchLockChallenge',
  'VoiceProfile',
  'RangeSnapshot',
  'VocalFamily',
  'PersonalPlan',
  'Insights',
  'Milestones',
  'CompareProgress',
]

export function getEnabledStackScreenNames(flags: SurfaceFlags): string[] {
  const names = [...CORE_STACK_SCREENS] as string[]

  if (flags.karaokeOn) {
    names.push('KaraokeMode')
  }

  if (flags.performanceOn) {
    names.push('PerformanceMode', 'PerformancePreview')
  }

  if (flags.dev) {
    names.push(
      'Billing',
      'Privacy',
      'SandboxHub',
      'ComponentPlayground',
      'FlowPlayground',
      'ScreenPreviewGallery',
      'ScreenPreviewScenario',
      'StorybookScreen',
    )
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
