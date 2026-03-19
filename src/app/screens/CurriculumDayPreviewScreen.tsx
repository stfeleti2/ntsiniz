import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Card } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { enableGuidedJourneyV3 } from '@/core/config/flags'
import { ensureJourneyV3Progress } from '@/core/guidedJourney/progress'
import { loadGuidedJourneyProgram } from '@/core/guidedJourney/loader'
import { mapPackLessonToHostDrills } from '@/core/guidedJourney/hostDrillMapper'
import { BrandWorldBackdrop, ChapterHeroCard, CoachInset, DemoLoopCard, StatusPill, TechniqueVisualCard, VoiceGuideCard } from '@/ui/guidedJourney'

type Props = NativeStackScreenProps<RootStackParamList, 'CurriculumDayPreview'>

type PreviewVm = {
  lessonId: string
  stageId: string
  stageTitle: string
  lessonTitle: string
  purpose: string
  estimatedTime: string
  whyThisMatters: string
  successLine: string
  techniqueLine: string
  plan: Array<{ packDrillId: string; title: string; family: string; supported: boolean; instructions: string }>
}

const copy = {
  fallbackTitle: 'Lesson preview',
  fallbackBody: 'The guided lesson preview is only available while the V3 journey flag is on.',
  title: 'Lesson preview',
  subtitle: 'A short concept explainer, a drill preview, and one clean way into the mission.',
  planTitle: 'Live drill plan',
  startLesson: 'Start lesson',
  loading: 'Loading this lesson…',
  live: 'Live',
  queued: 'Queued',
  whyTitle: 'Why it matters',
  conceptTitle: 'Concept explainer',
  successTitle: 'What success looks like',
  techniqueTitle: 'Technique help',
  back: 'Back',
}

export function CurriculumDayPreviewScreen({ navigation, route }: Props) {
  const [vm, setVm] = useState<PreviewVm | null>(null)

  useEffect(() => {
    if (!enableGuidedJourneyV3()) {
      setVm(null)
      return
    }

    ;(async () => {
      const program = loadGuidedJourneyProgram()
      const progress = await ensureJourneyV3Progress()
      const lesson = program.lessonsById[route.params.dayId] ?? program.lessonsById[progress.lessonId ?? ''] ?? program.lessons[0]
      const stage = program.stagesById[lesson.stageId] ?? program.stages[0]
      const mapped = mapPackLessonToHostDrills(lesson.id, progress.routeId)
      const firstPackDrill = mapped[0] ? program.drillsById[mapped[0].packDrillId] : null

      setVm({
        lessonId: lesson.id,
        stageId: stage.id,
        stageTitle: stage.title,
        lessonTitle: lesson.title,
        purpose: lesson.purpose,
        estimatedTime: lesson.estimatedTime,
        whyThisMatters: firstPackDrill?.targetSkill ? `This lesson builds ${firstPackDrill.targetSkill.replace(/_/g, ' ')} so songs feel easier and steadier.` : stage.learnerProfile,
        successLine: firstPackDrill?.passCriteria || lesson.completionCriteria[0] || 'Finish the mission with one real pass and one clean correction.',
        techniqueLine: firstPackDrill?.correctionCues[0] || firstPackDrill?.coachCues[0] || 'Keep the breath calm and make small pitch moves instead of jumping.',
        plan: mapped,
      })
    })().catch(() => setVm(null))
  }, [route.params.dayId])

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

      <ChapterHeroCard title={vm.lessonTitle} subtitle={`${vm.stageTitle} · ${vm.estimatedTime}`} stageLabel={vm.stageTitle} cta={copy.startLesson} onPress={() => navigation.navigate('MainTabs' as any, { screen: 'Session', params: { lessonId: vm.lessonId, stageId: vm.stageId } } as any)} />

      <VoiceGuideCard title={copy.whyTitle} body={vm.whyThisMatters} pill={vm.stageTitle} />
      <DemoLoopCard title={copy.conceptTitle} body={vm.purpose} />
      <TechniqueVisualCard title={copy.successTitle} body={vm.successLine} />
      <CoachInset title={copy.techniqueTitle} body={vm.techniqueLine} />

      <Card tone="elevated">
        <Text preset="h2">{copy.planTitle}</Text>
        <Box style={{ height: 10 }} />
        <Box style={{ gap: 10 }}>
          {vm.plan.map((item, index) => (
            <Card key={item.packDrillId} tone={index === 0 ? 'glow' : 'default'}>
              <Box style={{ gap: 8 }}>
                <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <Text preset="body" style={{ fontWeight: '900', flex: 1 }}>{item.title}</Text>
                  <StatusPill state={index === 0 ? 'ready' : 'paused'} label={index === 0 ? copy.live : copy.queued} />
                </Box>
                <Text preset="muted">{item.instructions}</Text>
              </Box>
            </Card>
          ))}
        </Box>
      </Card>

      <Button text={copy.startLesson} onPress={() => navigation.navigate('MainTabs' as any, { screen: 'Session', params: { lessonId: vm.lessonId, stageId: vm.stageId } } as any)} />
      <Button text={copy.back} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
