import { WelcomeScreen } from '../screens/WelcomeScreen'
import { CalibrationScreen } from '../screens/CalibrationScreen'
import { OnboardingScreen } from '../screens/OnboardingScreen'
import { WakeYourVoiceScreen } from '../screens/WakeYourVoiceScreen'
import { FirstWinResultScreen } from '../screens/FirstWinResultScreen'
import { RecoveryScreen } from '../screens/RecoveryScreen'
import { TunerScreen } from '../screens/TunerScreen'
import { MicTestScreen } from '../screens/MicTestScreen'
import { DrillScreen } from '../screens/DrillScreen'
import { DrillResultScreen } from '../screens/DrillResultScreen'
import { ResultsScreen } from '../screens/ResultsScreen'
import { PlaybackScreen } from '../screens/PlaybackScreen'
import { RecoveredTakesScreen } from '../screens/RecoveredTakesScreen'
import { CurriculumOverviewScreen } from '../screens/CurriculumOverviewScreen'
import { CurriculumDayPreviewScreen } from '../screens/CurriculumDayPreviewScreen'
import { LessonIntroScreen } from '../screens/LessonIntroScreen'
import { ConceptExplainerScreen } from '../screens/ConceptExplainerScreen'
import { TechniqueHelpScreen } from '../screens/TechniqueHelpScreen'
import { WhyThisMattersScreen } from '../screens/WhyThisMattersScreen'
import { DrillPrepScreen } from '../screens/DrillPrepScreen'
import { DayCompleteScreen } from '../screens/DayCompleteScreen'
import { MainTabs } from './MainTabs'
import { BillingScreen } from '../screens/BillingScreen'
import { MissionsScreen } from '../screens/MissionsScreen'
import { AdminContentScreen } from '../screens/AdminContentScreen'
import { PermissionsPrimerScreen } from '../screens/PermissionsPrimerScreen'
import { PrivacyScreen } from '../screens/PrivacyScreen'
import InviteScreen from '../screens/InviteScreen'
import CreatorProfileScreen from '../screens/CreatorProfileScreen'
import SyncStatusScreen from '../screens/SyncStatusScreen'
import { PaywallScreen } from '../screens/PaywallScreen'
import { AudioTortureLabScreen } from '../screens/AudioTortureLabScreen'
import { SessionSummaryScreen } from '../screens/SessionSummaryScreen'
import { WeeklyReportScreen } from '../screens/WeeklyReportScreen'
import { PitchLockChallengeScreen } from '../screens/PitchLockChallengeScreen'
import { KaraokeModeScreen } from '../screens/KaraokeModeScreen'
import { PerformanceModeScreen } from '../screens/PerformanceModeScreen'
import { PerformancePreviewScreen } from '../screens/PerformancePreviewScreen'
import { VoiceProfileScreen } from '../screens/VoiceProfileScreen'
import { RangeSnapshotScreen } from '../screens/RangeSnapshotScreen'
import { VocalFamilyScreen } from '../screens/VocalFamilyScreen'
import { PersonalPlanScreen } from '../screens/PersonalPlanScreen'
import { InsightsScreen } from '../screens/InsightsScreen'
import { MilestonesScreen } from '../screens/MilestonesScreen'
import { CompareProgressScreen } from '../screens/CompareProgressScreen'
import { enableKaraokeV1, enablePerformanceModeV1 } from '@/core/config/flags'

import type { RootStackParamList } from './types'

type StackScreenName = keyof RootStackParamList
export type ScreenDef = {
  name: StackScreenName
  component: any
  options?: any
}

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

export function buildLinkingConfig(flags: Pick<SurfaceFlags, 'socialOn' | 'invitesOn'>) {
  return {
    prefixes: ['ntsiniz://'],
    config: {
      screens: {
        ...(flags.socialOn ? { ImportCode: 'import' } : {}),
        ...(flags.invitesOn ? { Invite: 'invite' } : {}),
      },
    },
  } as any
}

export function getEnabledStackScreens(flags: SurfaceFlags): ScreenDef[] {
  const base: ScreenDef[] = [
    { name: 'Welcome', component: WelcomeScreen },
    { name: 'Calibration', component: CalibrationScreen, options: { animation: 'slide_from_right' } },
    { name: 'Onboarding', component: OnboardingScreen, options: { animation: 'slide_from_right' } },
    { name: 'PermissionsPrimer', component: PermissionsPrimerScreen, options: { animation: 'fade_from_bottom' } },
    { name: 'WakeYourVoice', component: WakeYourVoiceScreen, options: { animation: 'slide_from_right' } },
    { name: 'FirstWinResult', component: FirstWinResultScreen, options: { animation: 'fade_from_bottom' } },
    { name: 'Recovery', component: RecoveryScreen, options: { animation: 'fade_from_bottom' } },
    { name: 'MainTabs', component: MainTabs },
    { name: 'Tuner', component: TunerScreen, options: { animation: 'slide_from_right' } },
    { name: 'MicTest', component: MicTestScreen, options: { animation: 'slide_from_right' } },
    { name: 'Drill', component: DrillScreen, options: { animation: 'slide_from_right' } },
    { name: 'DrillResult', component: DrillResultScreen, options: { animation: 'fade_from_bottom' } },
    { name: 'Results', component: ResultsScreen, options: { animation: 'fade_from_bottom' } },
    { name: 'Playback', component: PlaybackScreen, options: { animation: 'slide_from_right' } },
    { name: 'RecoveredTakes', component: RecoveredTakesScreen, options: { animation: 'slide_from_right' } },
    { name: 'CurriculumOverview', component: CurriculumOverviewScreen, options: { animation: 'slide_from_right' } },
    { name: 'CurriculumDayPreview', component: CurriculumDayPreviewScreen, options: { animation: 'slide_from_right' } },
    { name: 'LessonIntro', component: LessonIntroScreen, options: { animation: 'slide_from_right' } },
    { name: 'ConceptExplainer', component: ConceptExplainerScreen, options: { animation: 'slide_from_right' } },
    { name: 'TechniqueHelp', component: TechniqueHelpScreen, options: { animation: 'slide_from_right' } },
    { name: 'WhyThisMatters', component: WhyThisMattersScreen, options: { animation: 'slide_from_right' } },
    { name: 'DrillPrep', component: DrillPrepScreen, options: { animation: 'slide_from_right' } },
    { name: 'DayComplete', component: DayCompleteScreen, options: { animation: 'fade_from_bottom' } },
    { name: 'Paywall', component: PaywallScreen, options: { animation: 'fade_from_bottom' } },
    { name: 'SessionSummary', component: SessionSummaryScreen, options: { animation: 'fade_from_bottom' } },
    { name: 'WeeklyReport', component: WeeklyReportScreen, options: { animation: 'slide_from_right' } },
    { name: 'PitchLockChallenge', component: PitchLockChallengeScreen, options: { animation: 'slide_from_right' } },
    { name: 'VoiceProfile', component: VoiceProfileScreen, options: { animation: 'slide_from_right' } },
    { name: 'RangeSnapshot', component: RangeSnapshotScreen, options: { animation: 'slide_from_right' } },
    { name: 'VocalFamily', component: VocalFamilyScreen, options: { animation: 'slide_from_right' } },
    { name: 'PersonalPlan', component: PersonalPlanScreen, options: { animation: 'slide_from_right' } },
    { name: 'Insights', component: InsightsScreen, options: { animation: 'slide_from_right' } },
    { name: 'Milestones', component: MilestonesScreen, options: { animation: 'slide_from_right' } },
    { name: 'CompareProgress', component: CompareProgressScreen, options: { animation: 'slide_from_right' } },
  ]

  if (flags.karaokeOn && enableKaraokeV1()) {
    base.push({ name: 'KaraokeMode', component: KaraokeModeScreen, options: { animation: 'slide_from_right' } })
  }

  if (flags.performanceOn && enablePerformanceModeV1()) {
    base.push(
      { name: 'PerformanceMode', component: PerformanceModeScreen, options: { animation: 'slide_from_right' } },
      { name: 'PerformancePreview', component: PerformancePreviewScreen, options: { animation: 'slide_from_right' } },
    )
  }

  if (flags.dev) {
    base.push(
      { name: 'Billing', component: BillingScreen, options: { animation: 'slide_from_right' } },
      { name: 'Privacy', component: PrivacyScreen, options: { animation: 'slide_from_right' } },
    )
  }

  // Non-core operational/admin surfaces are not exposed in store builds by default.
  if (!flags.storeBuild) {
    base.push(
      { name: 'Missions', component: MissionsScreen, options: { animation: 'slide_from_right' } },
      { name: 'AdminContent', component: AdminContentScreen, options: { animation: 'slide_from_right' } },
    )
  }

  if (flags.invitesOn) {
    base.push({ name: 'Invite', component: InviteScreen, options: { animation: 'slide_from_right' } })
  }
  if (flags.socialOn) {
    base.push({ name: 'CreatorProfile', component: CreatorProfileScreen, options: { animation: 'slide_from_right' } })
  }
  if (flags.cloudOn) {
    base.push({ name: 'SyncStatus', component: SyncStatusScreen, options: { animation: 'slide_from_right' } })
  }

  if (__DEV__ && flags.dev) {
    base.push({ name: 'AudioTortureLab', component: AudioTortureLabScreen, options: { animation: 'slide_from_right' } })
  }

  return base
}
