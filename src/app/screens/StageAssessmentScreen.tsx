import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Card } from '@/ui/components/kit'
import { Button } from '@/ui/components/kit'
import { Box } from '@/ui'
import { track } from '@/app/telemetry'
import { enableGuidedJourneyV3 } from '@/core/config/flags'
import { ensureJourneyV3Progress, getCurrentJourneyV3, getLessonsForStage, getStageProgress } from '@/core/guidedJourney/progress'
import { loadGuidedJourneyProgram } from '@/core/guidedJourney/loader'
import {
  getAssessmentForStage,
  getAssessmentSectionLabel,
  getLoadTier,
  getPressureLadder,
  getRubricDimensionLabel,
  humanizeGuidedKey,
} from '@/core/guidedJourney/v6Selectors'
import { BrandWorldBackdrop, ChapterHeroCard, NextStepCard, StatusPill, VoiceGuideCard } from '@/ui/guidedJourney'

type Props = NativeStackScreenProps<RootStackParamList, 'StageAssessment'>

type StageAssessmentVm = {
  stageId: string
  stageTitle: string
  stageProfile: string
  lessonId: string
  lessonTitle: string
  assessmentId: string | null
  assessmentTitle: string
  progressLine: string
  readinessLine: string
  outcomeLine: string
  loadLine: string
  pressureLine: string
  healthLine: string
  remediationLine: string | null
  sections: Array<{ id: string; label: string; description: string; passed: boolean | null }>
  benchmarkRows: Array<{ id: string; title: string; family: string; supportLine: string }>
  rubricRows: Array<{ id: string; label: string; score: number }>
  cleared: boolean
}

const copy = {
  fallbackTitle: 'Stage benchmark',
  fallbackBody: 'The V6 benchmark view only runs while the guided journey is active.',
  title: 'Stage benchmark',
  subtitle: 'See the exact gate that moves this chapter forward: evidence, blockers, load, and pressure.',
  loading: 'Loading the current stage gate…',
  readinessTitle: 'Promotion read',
  sectionsTitle: 'Gate checks',
  benchmarkTitle: 'Benchmark reps',
  benchmarkBody: 'These are the benchmark-shaped reps the stage uses to build promotion trust.',
  rubricTitle: 'Strongest evidence',
  pressureTitle: 'Pressure + recovery',
  buildEvidence: 'Build evidence',
  continueTraining: 'Continue training',
  openPlan: 'Open personal plan',
  openChapter: 'Open chapter overview',
  planTitle: 'Personal plan',
  planBody: 'See the remediation lane, route bias, and next live action tied to this gate.',
  cleared: 'Cleared',
  building: 'Building',
  pending: 'Pending',
}

export function StageAssessmentScreen({ navigation, route }: Props) {
  const [vm, setVm] = useState<StageAssessmentVm | null>(null)

  useEffect(() => {
    if (!enableGuidedJourneyV3()) {
      setVm(null)
      return
    }

    ;(async () => {
      const program = loadGuidedJourneyProgram()
      const progress = await ensureJourneyV3Progress()
      const current = getCurrentJourneyV3(program, progress)
      const requestedStageId = route.params?.stageId ?? current.stage.id
      const stage = program.stagesById[requestedStageId] ?? current.stage
      const lessons = getLessonsForStage(program, stage.id)
      const lesson =
        (current.lesson.stageId === stage.id ? current.lesson : null) ??
        lessons.find((candidate) => candidate.id === progress.lessonId) ??
        lessons[0] ??
        current.lesson
      const stageProgress = getStageProgress(program, progress, stage.id)
      const assessment = getAssessmentForStage(program, stage.id)
      const assessmentRecord = progress.assessmentByStageId?.[stage.id]
      const loadTier = getLoadTier(program, assessmentRecord?.recommendedLoadTier ?? lesson.loadTierTarget)
      const pressureLadder = getPressureLadder(program, stage.id)
      const remediationId =
        assessmentRecord?.remediationBundleId ??
        (progress.stageId === stage.id ? progress.activeRemediationBundleId : null) ??
        null
      const remediationBundle = remediationId
        ? program.remediationRules.remediationBundles.find((bundle) => bundle.id === remediationId)
        : null
      const rubricRows = Object.entries(assessmentRecord?.rubricDimensions ?? {})
        .sort((left, right) => Number(right[1]) - Number(left[1]))
        .slice(0, 3)
        .map(([id, score]) => ({
          id,
          label: getRubricDimensionLabel(id),
          score: Number(score),
        }))
      const healthMonitoring = program.vocalHealthMonitoring

      setVm({
        stageId: stage.id,
        stageTitle: stage.title,
        stageProfile: stage.learnerProfile,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        assessmentId: assessment?.id ?? null,
        assessmentTitle: assessment?.title ?? `${stage.title} benchmark`,
        progressLine: `${stageProgress.completed}/${stageProgress.total} lessons complete in ${stage.title}.`,
        readinessLine:
          assessmentRecord?.completed
            ? assessmentRecord.outcome ?? assessment?.outcomes[0] ?? 'This stage gate is currently satisfied.'
            : assessmentRecord?.blockedPromotionReasons?.[0] ??
              assessment?.promotionRules[0] ??
              stage.promotionGateSummary ??
              'Build technical, transfer, and health evidence before promotion.',
        outcomeLine:
          assessmentRecord?.outcome ??
          assessment?.outcomes[assessmentRecord?.completed ? 0 : 1] ??
          'Keep building the chapter evidence with clean reps.',
        loadLine: loadTier ? `${loadTier.name} · ${loadTier.description}` : `${lesson.loadTierTarget ?? 'LT1'} load target for this stage.`,
        pressureLine: pressureLadder.length ? pressureLadder.slice(0, 2).join(' · ') : 'Pressure stays light until the current evidence set is clean.',
        healthLine:
          healthMonitoring?.yellowFlags?.[0] ??
          lesson.healthWatchouts[0] ??
          'If the voice feels tight, lighter reps win over more reps.',
        remediationLine: remediationBundle ? `${remediationBundle.name} · ${remediationBundle.lessonPattern[0] ?? 'targeted rebuild lane'}` : null,
        sections: (assessment?.sections ?? []).map((section) => ({
          id: section.name,
          label: getAssessmentSectionLabel(section.name),
          description: section.description,
          passed: assessmentRecord?.gateStatus?.[section.name] ?? null,
        })),
        benchmarkRows: (assessment?.benchmarkDrillIds ?? [])
          .map((id) => program.drillsById[id])
          .filter(Boolean)
          .slice(0, 4)
          .map((drill) => ({
            id: drill.id,
            title: drill.title,
            family: humanizeGuidedKey(drill.drillType),
            supportLine:
              drill.transferTaskType ??
              drill.pressureLadderStep ??
              drill.branchVariantHint ??
              drill.repertoireBridge ??
              drill.carryoverCue ??
              'Clean benchmark evidence still matters more than difficulty.',
          })),
        rubricRows,
        cleared: !!assessmentRecord?.completed,
      })

      track('stage_assessment_opened', { stageId: stage.id, assessmentId: assessment?.id ?? 'none' })
    })().catch(() => setVm(null))
  }, [route.params?.stageId])

  if (!enableGuidedJourneyV3()) {
    return (
      <Screen background="gradient">
        <Text preset="h1">{copy.fallbackTitle}</Text>
        <Text preset="muted">{copy.fallbackBody}</Text>
      </Screen>
    )
  }

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

      <ChapterHeroCard
        title={vm.assessmentTitle}
        subtitle={`${vm.stageProfile} · ${vm.progressLine}`}
        stageLabel={vm.stageTitle}
        cta={vm.cleared ? copy.continueTraining : copy.buildEvidence}
        onPress={() =>
          navigation.navigate('MainTabs' as any, {
            screen: 'Session',
            params: { lessonId: vm.lessonId, stageId: vm.stageId },
          } as any)
        }
      />

      <VoiceGuideCard
        title={copy.readinessTitle}
        body={`${vm.readinessLine} ${vm.outcomeLine}`}
        pill={vm.cleared ? copy.cleared : copy.building}
      />

      <Card tone="glow">
        <Text preset="h2">{copy.sectionsTitle}</Text>
        <Box style={{ height: 10 }} />
        <Box style={{ gap: 10 }}>
          {vm.sections.length ? (
            vm.sections.map((section) => (
              <Card key={section.id} tone={section.passed ? 'glow' : 'default'}>
                <Box style={{ gap: 8 }}>
                  <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <Text preset="body" style={{ fontWeight: '900', flex: 1 }}>{section.label}</Text>
                    <StatusPill
                      state={section.passed == null ? 'paused' : section.passed ? 'success' : 'blocked'}
                      label={section.passed == null ? copy.pending : section.passed ? copy.cleared : copy.building}
                    />
                  </Box>
                  <Text preset="muted">{section.description}</Text>
                </Box>
              </Card>
            ))
          ) : (
            <Text preset="muted">{vm.readinessLine}</Text>
          )}
        </Box>
      </Card>

      <Card tone="elevated">
        <Text preset="h2">{copy.benchmarkTitle}</Text>
        <Text preset="muted">{copy.benchmarkBody}</Text>
        <Box style={{ height: 10 }} />
        <Box style={{ gap: 10 }}>
          {vm.benchmarkRows.length ? (
            vm.benchmarkRows.map((row) => (
              <Card key={row.id} tone="default">
                <Box style={{ gap: 6 }}>
                  <Text preset="body" style={{ fontWeight: '900' }}>{row.title}</Text>
                  <Text preset="muted">{`${row.family} · ${row.supportLine}`}</Text>
                </Box>
              </Card>
            ))
          ) : (
            <Text preset="muted">{vm.readinessLine}</Text>
          )}
        </Box>
      </Card>

      {vm.rubricRows.length ? (
        <Card tone="elevated">
          <Text preset="h2">{copy.rubricTitle}</Text>
          <Box style={{ height: 10 }} />
          <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            {vm.rubricRows.map((row) => (
              <Box key={row.id} style={{ minWidth: 160, flexGrow: 1 }}>
                <Card tone="default">
                  <Box style={{ gap: 4 }}>
                    <Text preset="muted">{row.label}</Text>
                    <Text preset="h2">{String(Math.round(row.score))}</Text>
                  </Box>
                </Card>
              </Box>
            ))}
          </Box>
        </Card>
      ) : null}

      <VoiceGuideCard
        title={copy.pressureTitle}
        body={`${vm.loadLine} ${vm.remediationLine ? `· ${vm.remediationLine}` : ''} · ${vm.pressureLine} · ${vm.healthLine}`}
        pill={vm.stageTitle}
      />

      <NextStepCard title={copy.planTitle} body={copy.planBody} cta={copy.openPlan} onPress={() => navigation.navigate('PersonalPlan')} />
      <Button text={copy.openChapter} variant="ghost" onPress={() => navigation.navigate('CurriculumOverview')} />
    </Screen>
  )
}
