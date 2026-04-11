import test from 'node:test'
import assert from 'node:assert/strict'

import { getEnabledStackScreenNames, type SurfaceFlags } from '@/app/navigation/surfacePolicy'

function names(flags: SurfaceFlags) {
  return new Set(getEnabledStackScreenNames(flags))
}

test('store build does not expose Phase 3 / social / cloud surfaces', () => {
  const set = names({
    storeBuild: true,
    cloudOn: false,
    socialOn: false,
    invitesOn: false,
    duetsOn: false,
    competitionsOn: false,
    marketplaceOn: false,
    diagnosticsOn: false,
    karaokeOn: false,
    performanceOn: true,
    dev: false,
  })

  const forbidden = [
    'ChallengesHub',
    'Leaderboard',
    'Friends',
    'ImportCode',
    'CreatePost',
    'PostDetail',
    'Invite',
    'CreatorProfile',
    'Account',
    'SignIn',
    'SyncStatus',
    'DuetsHub',
    'DuetCreate',
    'DuetImport',
    'DuetSession',
    'CompetitionsHub',
    'CompetitionDetail',
    'CompetitionSubmit',
    'CompetitionLeaderboard',
    'Marketplace',
    'CoachTools',
    'ModTools',
    'SandboxHub',
    'ComponentPlayground',
    'FlowPlayground',
    'ScreenPreviewGallery',
    'ScreenPreviewScenario',
    'StorybookScreen',
  ]

  for (const f of forbidden) {
    assert.equal(set.has(f), false, `forbidden screen leaked into store build: ${f}`)
  }

  // Core surfaces must remain.
  for (const required of ['Welcome', 'PermissionsPrimer', 'WakeYourVoice', 'FirstWinResult', 'Recovery', 'MainTabs', 'Drill', 'DrillResult', 'StageAssessment', 'LessonIntro', 'ConceptExplainer', 'TechniqueHelp', 'WhyThisMatters', 'DrillPrep', 'PerformanceMode', 'PerformancePreview']) {
    assert.equal(set.has(required), true, `required screen missing: ${required}`)
  }
})

test('dev surfaces stay gated behind dev flag', () => {
  const prodLike = names({
    storeBuild: false,
    cloudOn: true,
    socialOn: true,
    invitesOn: true,
    duetsOn: true,
    competitionsOn: true,
    marketplaceOn: true,
    diagnosticsOn: false,
    karaokeOn: true,
    performanceOn: true,
    dev: false,
  })

  for (const hidden of ['SandboxHub', 'ComponentPlayground', 'FlowPlayground', 'ScreenPreviewGallery', 'ScreenPreviewScenario', 'StorybookScreen']) {
    assert.equal(prodLike.has(hidden), false, `dev-only surface should not appear without dev flag: ${hidden}`)
  }

  const devSet = names({
    storeBuild: false,
    cloudOn: true,
    socialOn: true,
    invitesOn: true,
    duetsOn: true,
    competitionsOn: true,
    marketplaceOn: true,
    diagnosticsOn: true,
    karaokeOn: true,
    performanceOn: true,
    dev: true,
  })

  for (const required of ['SandboxHub', 'ComponentPlayground', 'FlowPlayground', 'ScreenPreviewGallery', 'ScreenPreviewScenario', 'StorybookScreen']) {
    assert.equal(devSet.has(required), true, `dev-only surface missing when dev flag on: ${required}`)
  }
})

test('non-store build with social+cloud+invites enables expected surfaces', () => {
  const set = names({
    storeBuild: false,
    cloudOn: true,
    socialOn: true,
    invitesOn: true,
    duetsOn: false,
    competitionsOn: false,
    marketplaceOn: false,
    diagnosticsOn: false,
    karaokeOn: true,
    performanceOn: true,
    dev: false,
  })

  for (const expected of ['ImportCode', 'Invite', 'CreatorProfile', 'Account', 'SignIn', 'SyncStatus', 'KaraokeMode', 'PerformanceMode', 'PerformancePreview']) {
    assert.equal(set.has(expected), true, `expected screen missing: ${expected}`)
  }
})
