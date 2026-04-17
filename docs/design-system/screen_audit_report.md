# Screen System Audit Report

Generated: 2026-04-16T13:50:39.383Z

## Totals

- Screen files: 85
- Registered routes: 51
- Screen story files: 87

## Severity

- Critical: 41
- High: 69
- Medium: 20
- Low: 1

## Route / Story Gaps

- Registered routes missing screens: StorybookScreen
- Screen files without registered route: Account, ChallengesHub, CoachTools, Community, CompetitionDetail, CompetitionLeaderboard, CompetitionSubmit, CompetitionsHub, ComponentLab, CreatePost, DevRepeatability, Diagnostics, DuetCreate, DuetImport, DuetSession, DuetsHub, FeedbackDetail, FeedbackImport, FeedbackInbox, Friends, Home, ImportCode, Journey, Leaderboard, Marketplace, ModTools, PostDetail, ProgramDayComplete, ProgramDetail, ReportDetail, Session, Settings, SignIn, Storybook, Terms
- Registered routes missing stories: ScreenPreviewGallery, ScreenPreviewScenario, StorybookScreen
- Story files without route: Account, ChallengesHub, CoachTools, Community, CompetitionDetail, CompetitionLeaderboard, CompetitionSubmit, CompetitionsHub, ComponentLab, CreatePost, DevRepeatability, Diagnostics, DuetCreate, DuetImport, DuetSession, DuetsHub, FeedbackDetail, FeedbackImport, FeedbackInbox, Friends, Home, ImportCode, Journey, Leaderboard, Marketplace, MicPermission, ModTools, PostDetail, ProgramDayComplete, ProgramDetail, RangeFinder, ReportDetail, ScenarioStates, Session, Settings, SignIn, SingingLevelSelection, Storybook, Terms

## Screen Findings

| Screen | Route | Story | Missing App States | Missing Story States | Compliance Issues |
| --- | --- | --- | --- | --- | --- |
| Account | N | Y | loading | - | missing-states:loading |
| AdminContent | Y | Y | loading, error, success | - | missing-states:loading,error,success |
| AudioTortureLab | Y | Y | - | - | - |
| Billing | Y | Y | success | - | hardcoded-color-tokens, missing-states:success |
| Calibration | Y | Y | loading | - | missing-states:loading |
| ChallengesHub | N | Y | loading, empty | - | missing-states:loading,empty |
| CoachTools | N | Y | empty, success | - | missing-states:empty,success |
| Community | N | Y | loading, success | - | missing-states:loading,success |
| CompareProgress | Y | Y | - | - | hardcoded-color-tokens |
| CompetitionDetail | N | Y | loading, error, success | - | missing-states:loading,error,success |
| CompetitionLeaderboard | N | Y | loading, success | - | missing-states:loading,success |
| CompetitionsHub | N | Y | loading, error, success | - | missing-states:loading,error,success |
| CompetitionSubmit | N | Y | loading, success | - | missing-states:loading,success |
| ComponentLab | N | Y | - | - | missing-screen-wrapper |
| ComponentPlayground | Y | Y | loading, error | - | missing-screen-wrapper, missing-states:loading,error |
| ConceptExplainer | Y | Y | empty, success | - | missing-states:empty,success |
| CreatePost | N | Y | loading, success | - | missing-states:loading,success |
| CreatorProfile | Y | Y | success | - | missing-states:success |
| CurriculumDayPreview | Y | Y | - | - | - |
| CurriculumOverview | Y | Y | - | - | - |
| DayComplete | Y | Y | loading, success | - | hardcoded-color-tokens, missing-states:loading,success |
| DevRepeatability | N | Y | loading, success | - | missing-states:loading,success |
| Diagnostics | N | Y | loading, error, success | - | missing-states:loading,error,success |
| Drill | Y | Y | loading | loading, disabled, error, empty, success | hardcoded-color-tokens, missing-states:loading |
| DrillPrep | Y | Y | - | - | - |
| DrillResult | Y | Y | - | - | - |
| DuetCreate | N | Y | loading | - | missing-states:loading |
| DuetImport | N | Y | empty, success | - | missing-states:empty,success |
| DuetSession | N | Y | - | - | - |
| DuetsHub | N | Y | loading, success | - | missing-states:loading,success |
| FeedbackDetail | N | Y | empty, success | - | hardcoded-color-tokens, missing-states:empty,success |
| FeedbackImport | N | Y | success | - | missing-states:success |
| FeedbackInbox | N | Y | loading, empty, success | - | missing-states:loading,empty,success |
| FirstWinResult | Y | Y | success | - | hardcoded-color-tokens, missing-states:success |
| FlowPlayground | Y | Y | loading, error, success | - | missing-screen-wrapper, missing-states:loading,error,success |
| Friends | N | Y | loading, success | - | missing-states:loading,success |
| Home | N | Y | loading | - | hardcoded-color-tokens, missing-states:loading |
| ImportCode | N | Y | loading, empty, success | - | missing-states:loading,empty,success |
| Insights | Y | Y | success | - | missing-design-system-imports, missing-states:success |
| Invite | Y | Y | - | - | - |
| Journey | N | Y | - | - | - |
| KaraokeMode | Y | Y | error, success | - | missing-states:error,success |
| Leaderboard | N | Y | loading, success | - | missing-states:loading,success |
| LessonIntro | Y | Y | empty, success | - | hardcoded-color-tokens, missing-states:empty,success |
| Marketplace | N | Y | loading, empty, error, success | - | missing-states:loading,empty,error,success |
| MicTest | Y | Y | loading | - | missing-states:loading |
| Milestones | Y | Y | empty | - | missing-states:empty |
| Missions | Y | Y | empty, success | - | missing-states:empty,success |
| ModTools | N | Y | loading, success | - | missing-states:loading,success |
| Onboarding | Y | Y | success | - | hardcoded-color-tokens, missing-states:success |
| Paywall | Y | Y | success | - | hardcoded-color-tokens, missing-states:success |
| PerformanceMode | Y | Y | loading | - | hardcoded-color-tokens, missing-states:loading |
| PerformancePreview | Y | Y | success | - | hardcoded-color-tokens, missing-states:success |
| PermissionsPrimer | Y | Y | - | - | hardcoded-color-tokens |
| PersonalPlan | Y | Y | success | - | missing-design-system-imports, missing-states:success |
| PitchLockChallenge | Y | Y | loading, error | - | missing-states:loading,error |
| Playback | Y | Y | success | loading, disabled, error, empty, success | hardcoded-color-tokens, missing-states:success |
| PostDetail | N | Y | - | - | - |
| Privacy | Y | Y | loading, error, success | - | missing-states:loading,error,success |
| ProgramDayComplete | N | Y | loading | - | hardcoded-color-tokens, missing-states:loading |
| ProgramDetail | N | Y | loading | - | missing-states:loading |
| RangeSnapshot | Y | Y | success | - | hardcoded-color-tokens, missing-states:success |
| RecoveredTakes | Y | Y | loading, success | - | missing-states:loading,success |
| Recovery | Y | Y | loading, error, success | - | hardcoded-color-tokens, missing-states:loading,error,success |
| ReportDetail | N | Y | success | - | missing-states:success |
| Results | Y | Y | loading, success | - | missing-states:loading,success |
| SandboxHub | Y | Y | loading, empty, error, success | - | missing-screen-wrapper, missing-states:loading,empty,error,success |
| ScreenPreviewGallery | Y | N | loading, empty, error, success | default, loading, disabled, error, empty, success | missing-screen-wrapper, missing-states:loading,empty,error,success |
| ScreenPreviewScenario | Y | N | loading, empty, error, success | default, loading, disabled, error, empty, success | missing-screen-wrapper, direct-safe-area-usage, missing-states:loading,empty,error,success |
| Session | N | Y | - | - | hardcoded-color-tokens |
| SessionSummary | Y | Y | loading, success | loading, disabled, error, empty, success | missing-states:loading,success |
| Settings | N | Y | success | - | missing-states:success |
| SignIn | N | Y | - | - | - |
| StageAssessment | Y | Y | - | - | - |
| Storybook | N | Y | loading, empty, error, success | - | missing-screen-wrapper, missing-states:loading,empty,error,success |
| SyncStatus | Y | Y | success | - | missing-states:success |
| TechniqueHelp | Y | Y | empty, success | - | missing-states:empty,success |
| Terms | N | Y | loading, empty, error, success | - | missing-states:loading,empty,error,success |
| Tuner | Y | Y | - | - | - |
| VocalFamily | Y | Y | success | - | missing-states:success |
| VoiceProfile | Y | Y | success | - | missing-states:success |
| WakeYourVoice | Y | Y | loading, success | - | hardcoded-color-tokens, missing-states:loading,success |
| WeeklyReport | Y | Y | error, success | - | missing-states:error,success |
| Welcome | Y | Y | success | loading, disabled, error, empty, success | hardcoded-color-tokens, missing-states:success |
| WhyThisMatters | Y | Y | empty | - | missing-states:empty |