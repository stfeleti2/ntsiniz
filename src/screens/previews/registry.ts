import type { ComponentType } from 'react'
import type { ScreenPreviewScenario } from './types'
import { WelcomePreview } from './WelcomePreview'
import { SingingLevelSelectionPreview } from './SingingLevelSelectionPreview'
import { MicPermissionPreview } from './MicPermissionPreview'
import { RangeFinderPreview } from './RangeFinderPreview'
import { DrillPreview } from './DrillPreview'
import { PlaybackPreview } from './PlaybackPreview'
import { SessionSummaryPreview } from './SessionSummaryPreview'

type PreviewDefinition = {
  id: ScreenPreviewScenario
  title: string
  description: string
  component: ComponentType
}

export const screenPreviewRegistry: Record<ScreenPreviewScenario, PreviewDefinition> = {
  welcome: {
    id: 'welcome',
    title: 'Welcome / Splash',
    description: 'First impression and start CTA.',
    component: WelcomePreview,
  },
  'singing-level': {
    id: 'singing-level',
    title: 'Singing Level Selection',
    description: 'User profile calibration step.',
    component: SingingLevelSelectionPreview,
  },
  'mic-permission': {
    id: 'mic-permission',
    title: 'Mic Permission',
    description: 'Permission rationale and next actions.',
    component: MicPermissionPreview,
  },
  'range-finder': {
    id: 'range-finder',
    title: 'Range Finder',
    description: 'Range calibration before drills.',
    component: RangeFinderPreview,
  },
  drill: {
    id: 'drill',
    title: 'Singing Drill',
    description: 'Live drill controls and state.',
    component: DrillPreview,
  },
  playback: {
    id: 'playback',
    title: 'Playback',
    description: 'Playback controls and waveform context.',
    component: PlaybackPreview,
  },
  'session-summary': {
    id: 'session-summary',
    title: 'Session Summary / Win',
    description: 'Post-session outcome and encouragement.',
    component: SessionSummaryPreview,
  },
}

export const orderedScreenPreviews = Object.values(screenPreviewRegistry)

