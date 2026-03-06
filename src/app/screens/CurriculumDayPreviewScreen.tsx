import React, { useEffect, useMemo, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Card } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { loadCurriculum } from '@/core/curriculum/loader'
import { getCurriculumState } from '@/core/curriculum/progress'
import { loadAllBundledPacks } from '@/core/drills/loader'
import { loadPhase1Lessons, loadProRegimenLessons, loadProRegimen12Lessons, findLesson } from '@/core/coaching/lessons'
import { msUntilTomorrow, formatCountdown } from '@/core/time/countdown'
import { getSettings } from '@/core/storage/settingsRepo'

type Props = NativeStackScreenProps<RootStackParamList, 'CurriculumDayPreview'>

export function CurriculumDayPreviewScreen({ navigation, route }: Props) {
  const { dayId } = route.params
  const [activeCurriculum, setActiveCurriculum] = useState<'phase1' | 'pro_regimen' | 'pro_regimen12'>('phase1')
  const [activeTrack, setActiveTrack] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')

  useEffect(() => {
    getSettings()
      .then((s) => {
        setActiveCurriculum((s.activeCurriculum ?? 'phase1') as any)
        setActiveTrack((s.activeTrack ?? 'beginner') as any)
      })
      .catch(() => {})
  }, [])

  const curr = useMemo(() => loadCurriculum(activeCurriculum as any, activeTrack as any), [activeCurriculum, activeTrack])
  const pack = useMemo(() => loadAllBundledPacks(), [])
  const lessons = useMemo(() => {
    if (activeCurriculum === 'pro_regimen12') return loadProRegimen12Lessons(activeTrack)
    if (activeCurriculum === 'pro_regimen') return loadProRegimenLessons()
    return loadPhase1Lessons()
  }, [activeCurriculum, activeTrack])
  const [locked, setLocked] = useState(false)
  const [tomorrow, setTomorrow] = useState(false)
  const [countdown, setCountdown] = useState<string | null>(null)

  const day = useMemo(() => curr.days.find((d) => d.id === dayId) ?? curr.days[0], [curr.days, dayId])
  const idx = useMemo(() => curr.days.findIndex((d) => d.id === day?.id), [curr.days, day?.id])

  const lesson = useMemo(() => findLesson(lessons, (day as any)?.lessonId), [lessons, day])

  useEffect(() => {
    ;(async () => {
      const st = await getCurriculumState(curr)
      const maxStartIndex = st.doneToday ? st.displayIndex : st.dayIndex
      const isLocked = idx > maxStartIndex
      const isTomorrow = st.doneToday && idx === st.dayIndex // next day is locked until tomorrow after you've completed today
      setLocked(isLocked)
      setTomorrow(isTomorrow)
      setCountdown(isLocked && isTomorrow ? formatCountdown(msUntilTomorrow()) : null)
    })().catch(() => {})
  }, [curr, idx])

  useEffect(() => {
    if (!locked || !tomorrow) return
    const id = setInterval(() => setCountdown(formatCountdown(msUntilTomorrow())), 1000)
    return () => clearInterval(id)
  }, [locked, tomorrow])

  const drillTitles = useMemo(() => {
    return (day?.drillIds ?? [])
      .map((id) => pack.drills.find((x) => x.id === id)?.title ?? id)
      .slice(0, 6)
  }, [day, pack.drills])

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('curriculumPreview.title')}</Text>
        <Text preset="muted">
          {t('curriculum.dayLabel', { week: day.week, day: day.day })} • {day.title}
        </Text>
      </Box>

      <Card tone={locked ? 'default' : 'glow'}>
        <Text preset="h2">{locked ? t('curriculumPreview.previewOnlyTitle') : t('curriculumPreview.readyTitle')}</Text>
        <Text preset="muted">{day.focus}</Text>

        {locked ? (
          <Box style={{ marginTop: 10, gap: 6 }}>
            <Text preset="muted">{t('curriculumPreview.lockedLine')}</Text>
            {tomorrow && countdown ? (
              <Text preset="muted" style={{ fontWeight: '900' }}>
                {t('curriculumPreview.unlocksIn', { value: countdown })}
              </Text>
            ) : null}
          </Box>
        ) : null}

        {lesson ? (
          <Box style={{ marginTop: 12, gap: 6 }}>
            <Text preset="body" style={{ fontWeight: '900' }}>{t('curriculumPreview.lessonTitle')}</Text>
            <Text preset="muted">{lesson.title}</Text>
            <Text preset="muted">{lesson.body}</Text>
          </Box>
        ) : null}

        {drillTitles.length ? (
          <Box style={{ marginTop: 12, gap: 6 }}>
            <Text preset="body" style={{ fontWeight: '900' }}>{t('curriculumPreview.drillsTitle')}</Text>
            {drillTitles.map((x) => (
              <Text key={x} preset="muted">{`• ${x}`}</Text>
            ))}
          </Box>
        ) : null}

        <Box style={{ marginTop: 14, gap: 10 }}>
          {!locked ? (
            <Button
              text={t('curriculumPreview.startThisDay')}
              onPress={() => (navigation as any).replace('MainTabs', { screen: 'Session', params: { curriculumDayId: day.id } })}
            />
          ) : null}
          <Button text={t('curriculumPreview.openOverview')} variant="soft" onPress={() => navigation.replace('CurriculumOverview' as any)} />
          <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
        </Box>
      </Card>
    </Screen>
  )
}