import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { listRecentAttempts } from '@/core/storage/attemptsRepo'
import { getVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'
import { ensureJourneyV3Progress, getCurrentJourneyV3 } from '@/core/guidedJourney/progress'
import { loadGuidedJourneyProgram } from '@/core/guidedJourney/loader'
import { getAssessmentFocusSummary, humanizeGuidedKey, summarizeGuidedAttemptEvidence } from '@/core/guidedJourney/v6Selectors'
import { BrandWorldBackdrop, ChapterHeroCard, NextStepCard, StartingProfileCard, VoiceSnapshotCard } from '@/ui/guidedJourney'
import { PremiumRangePracticePanel } from '@/ui/onboarding/PremiumRangePracticePanel'
import { likelyZoneFromBand } from '@/ui/onboarding/rangeLadder'
import { t } from '@/app/i18n'

type Props = NativeStackScreenProps<RootStackParamList, 'VoiceProfile'>

const copy = {
  title: 'Voice profile',
  subtitle: 'A soft snapshot of where your voice feels strongest right now.',
  profileTitle: 'Strengths',
  profileBody: 'These come from your first win and recent route-aware reps.',
  focusTitle: 'Current focus',
  focusBody: 'This is the main training thread we are pushing next.',
  rangeTitle: 'Range snapshot',
  rangeBody: 'See your soft bounds and comfort zone.',
  familyTitle: 'Vocal family',
  familyBody: 'Only shown when confidence is strong enough.',
  benchmarkTitle: 'Stage benchmark',
  benchmarkBody: 'See the current gate, evidence set, and the next thing that still needs to clear.',
  planTitle: 'Personal plan',
  planBody: 'Route, stage, lesson, and next live action in one place.',
  loading: 'Loading your voice profile…',
  insights: 'Open insights',
  likelyRangeTitle: 'Likely range zone',
  likelyRangeBody: 'Closest estimate based on current confidence.',
}

export function VoiceProfileScreen({ navigation }: Props) {
  const [vm, setVm] = useState<{
    stageTitle: string
    lessonTitle: string
    voice: Awaited<ReturnType<typeof getVoiceIdentity>>
    strengthItems: string[]
    focusItems: string[]
  } | null>(null)

  useEffect(() => {
    ;(async () => {
      const program = loadGuidedJourneyProgram()
      const progress = await ensureJourneyV3Progress()
      const current = getCurrentJourneyV3(program, progress)
      const [voice, attempts] = await Promise.all([getVoiceIdentity(), listRecentAttempts(40)])
      const focus = getAssessmentFocusSummary(program, current.stage.id)
      const evidence = summarizeGuidedAttemptEvidence(attempts)
      setVm({
        stageTitle: current.stage.title,
        lessonTitle: current.lesson.title,
        voice: {
          ...voice,
          currentAssessmentFocus: voice.currentAssessmentFocus?.length ? voice.currentAssessmentFocus : focus,
        },
        strengthItems: uniqueLines([
          ...(voice.strengths.length ? voice.strengths : ['You gave the app a real first-win signal.']),
          evidence.strongestDimensions[0] ? `${evidence.strongestDimensions[0].label} is looking strongest right now.` : null,
          evidence.strongestDimensions[1] ? `${evidence.strongestDimensions[1].label} is starting to repeat more reliably.` : null,
          evidence.recentFamilies[0] ? `Most active family lately: ${evidence.recentFamilies[0].label}.` : null,
        ]).slice(0, 4),
        focusItems: uniqueLines([
          ...(voice.currentFocus.length ? voice.currentFocus : ['We are keeping the next reps calm and clear.']),
          ...(voice.currentAssessmentFocus?.slice(0, 2) ?? focus.slice(0, 2)),
          evidence.weakestDimensions[0] ? `${evidence.weakestDimensions[0].label} still wants steadier reps.` : null,
          evidence.blockedGates[0] ? `${evidence.blockedGates[0].label} is the gate showing up most often.` : null,
          voice.activeRemediationBundleName ? `Active repair lane: ${humanizeGuidedKey(voice.activeRemediationBundleName)}` : 'No active remediation bundle.',
        ]).slice(0, 5),
      })
    })().catch(() => setVm(null))
  }, [])

  if (!vm) {
    return (
      <Screen background="hero">
        <BrandWorldBackdrop />
        <Text preset="h1">{copy.title}</Text>
        <Text preset="muted">{copy.loading}</Text>
      </Screen>
    )
  }

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{copy.title}</Text>
        <Text preset="muted">{copy.subtitle}</Text>
      </Box>

      <ChapterHeroCard title={vm.lessonTitle} subtitle={vm.voice.currentFocus[0] ?? 'Your next lesson is already lined up.'} stageLabel={vm.stageTitle} />

      <VoiceSnapshotCard
        title={t('guidedFlow.rangePositionTitle')}
        body="Closest range zone from your trusted recent reps."
        items={[
          vm.voice.comfortZone.lowMidi != null && vm.voice.comfortZone.highMidi != null
            ? `Comfort span: ${vm.voice.comfortZone.lowMidi}-${vm.voice.comfortZone.highMidi} midi`
            : 'Comfort span is still warming up.',
        ]}
      />

      <PremiumRangePracticePanel
        likelyZone={likelyZoneFromBand({
          low: vm.voice.comfortZone.lowMidi ?? null,
          high: vm.voice.comfortZone.highMidi ?? null,
        })}
        progress={0.42}
        traceValues={buildProfileTrace(vm.voice.comfortZone.lowMidi ?? null, vm.voice.comfortZone.highMidi ?? null)}
        phraseChunks={['steady', 'clean', 'entry']}
        elapsedLabel="00:42"
        totalLabel="01:40"
      />

      <VoiceSnapshotCard
        title={copy.likelyRangeTitle}
        body={copy.likelyRangeBody}
        items={[
          vm.voice.likelyFamily.confidence >= 0.66 && vm.voice.likelyFamily.label ? `Closest to ${vm.voice.likelyFamily.label}` : 'Closest zone is still refining.',
          vm.voice.comfortZone.lowMidi != null && vm.voice.comfortZone.highMidi != null
            ? `Comfort span: ${vm.voice.comfortZone.lowMidi}-${vm.voice.comfortZone.highMidi} midi`
            : 'Comfort span is still warming up.',
        ]}
      />

      <StartingProfileCard title={copy.profileTitle} body={copy.profileBody} items={vm.strengthItems} />
      <VoiceSnapshotCard
        title={copy.focusTitle}
        body={copy.focusBody}
        items={vm.focusItems}
      />

      <NextStepCard title={copy.rangeTitle} body={copy.rangeBody} cta="Open range snapshot" onPress={() => navigation.navigate('RangeSnapshot')} />
      <NextStepCard title={copy.familyTitle} body={copy.familyBody} cta="Open vocal family" onPress={() => navigation.navigate('VocalFamily')} />
      <NextStepCard title={copy.benchmarkTitle} body={vm.voice.currentAssessmentFocus?.[0] ?? copy.benchmarkBody} cta="Open benchmark" onPress={() => navigation.navigate('StageAssessment')} />
      <NextStepCard title={copy.planTitle} body={copy.planBody} cta="Open personal plan" onPress={() => navigation.navigate('PersonalPlan')} />

      <Button text={copy.insights} variant="ghost" onPress={() => navigation.navigate('Insights')} />
    </Screen>
  )
}

function uniqueLines(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)))
}

function buildProfileTrace(low: number | null, high: number | null) {
  if (low == null || high == null) return [0.45, 0.49, 0.53, 0.5, 0.48, 0.51]
  const span = Math.max(1, high - low)
  const arc = Math.max(0.05, Math.min(0.18, span / 30))
  const centerBias = ((low + high) / 2 - 58) * 0.01
  return new Array(48).fill(0).map((_, index) => {
    const v = 0.5 + Math.sin((index / 47) * Math.PI) * arc + centerBias
    return Math.max(0, Math.min(1, v))
  })
}
