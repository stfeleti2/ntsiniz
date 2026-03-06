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
import { msUntilTomorrow, formatCountdown } from '@/core/time/countdown'
import { loadAllBundledPacks } from '@/core/drills/loader'
import { getSettings } from '@/core/storage/settingsRepo'

type Props = NativeStackScreenProps<RootStackParamList, 'CurriculumOverview'>

type DayStatus = 'done' | 'today' | 'upcoming' | 'done_today' | 'tomorrow_locked' | 'locked'

export function CurriculumOverviewScreen({ navigation }: Props) {
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
  const [currState, setCurrState] = useState<{
    dayIndex: number
    displayIndex: number
    doneToday: boolean
    doneCount: number
    total: number
    pct: number
    todayDay: any
    nextDay: any
  } | null>(null)
  const [unlockIn, setUnlockIn] = useState<string | null>(null)

  useEffect(() => {
    getCurriculumState(curr)
      .then((st) => {
        setCurrState(st as any)
        setUnlockIn(st.doneToday && st.nextDay ? formatCountdown(msUntilTomorrow()) : null)
      })
      .catch(() => setCurrState(null))
  }, [curr])

  useEffect(() => {
    if (!currState?.doneToday || !currState?.nextDay) return
    const id = setInterval(() => setUnlockIn(formatCountdown(msUntilTomorrow())), 1000)
    return () => clearInterval(id)
  }, [currState?.doneToday, currState?.nextDay])

  const total = currState?.total ?? curr.days.length
  const done = currState?.doneCount ?? 0
  const pct = currState?.pct ?? 0

  const dayIndex = currState?.dayIndex ?? 0
  const displayIndex = currState?.displayIndex ?? 0
  const doneToday = !!currState?.doneToday
  const today = currState?.todayDay ?? curr.days[0]
  const tomorrowDay = doneToday ? currState?.nextDay ?? null : null

  const byWeek = useMemo(() => {
    const out: Record<number, typeof curr.days> = {}
    for (const d of curr.days) {
      out[d.week] = out[d.week] ? [...out[d.week], d] : [d]
    }
    return out
  }, [curr.days])

  const statusForIndex = (idx: number): DayStatus => {
    if (!doneToday) {
      if (idx < dayIndex) return 'done'
      if (idx === dayIndex) return 'today'
      return 'upcoming'
    }

    // When you already completed today, keep the completed day visible as “done today”,
    // and lock the next day until tomorrow.
    if (idx < displayIndex) return 'done'
    if (idx === displayIndex) return 'done_today'
    if (idx === dayIndex) return 'tomorrow_locked'
    return 'locked'
  }

  const startDay = (dayId: string) => {
    ;(navigation as any).replace('MainTabs', {
      screen: 'Session',
      params: { curriculumDayId: dayId },
    })
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('curriculumOverview.title')}</Text>
        <Text preset="muted">{t('curriculumOverview.subtitle')}</Text>
      </Box>

            <Card tone="glow">
        <Text preset="h2">{t('curriculumOverview.progressTitle')}</Text>
        <Text preset="muted">{t('curriculumOverview.progressLine', { done, total, pct })}</Text>

        {doneToday && tomorrowDay ? (
          <Box style={{ marginTop: 10, gap: 10 }}>
            <Text preset="body" style={{ fontWeight: '900' }}>{t('curriculumOverview.doneForToday')}</Text>
            <Text preset="muted">{t('curriculumOverview.tomorrowLine', { title: tomorrowDay.title })}</Text>
            {unlockIn ? <Text preset="muted">{t('curriculumOverview.unlocksIn', { value: unlockIn })}</Text> : null}
            <Button
              text={t('curriculumOverview.previewTomorrow')}
              variant="soft"
              onPress={() => (navigation as any).navigate('CurriculumDayPreview', { dayId: tomorrowDay.id })}
            />
            <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
          </Box>
        ) : (
          <Box style={{ marginTop: 10, gap: 10 }}>
            <Button
              text={t('curriculumOverview.startToday')}
              onPress={() => startDay(today?.id ?? curr.days[0].id)}
            />
            <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
          </Box>
        )}
      </Card>

      {Object.keys(byWeek)
        .map((k) => Number(k))
        .sort((a, b) => a - b)
        .map((week, idx) => (
          <Card key={`${week}-${idx}`} tone="elevated">
            <Text preset="h2">{t('curriculumOverview.weekTitle', { week })}</Text>
            <Text preset="muted">{t('curriculumOverview.weekHint')}</Text>

            <Box style={{ marginTop: 10, gap: 10 }}>
              {byWeek[week].map((d) => {
                const idx = curr.days.findIndex((x) => x.id === d.id)
                const st = statusForIndex(idx)
                const tag =
                  st === 'done'
                    ? t('curriculumOverview.tagDone')
                    : st === 'today'
                      ? t('curriculumOverview.tagToday')
                      : st === 'done_today'
                        ? t('curriculumOverview.tagDoneToday')
                        : st === 'tomorrow_locked'
                          ? t('curriculumOverview.tagTomorrowLocked')
                          : t('curriculumOverview.tagLocked')
                const btn =
                  st === 'today'
                    ? t('curriculumOverview.ctaStart')
                    : st === 'done' || st === 'done_today'
                      ? t('curriculumOverview.ctaRedo')
                      : t('curriculumOverview.ctaPreview')
                const drillTitles = (d.drillIds ?? [])
                  .map((id) => pack.drills.find((x) => x.id === id)?.title ?? id)
                  .slice(0, 3)
                  .join(' • ')

                return (
                  <Box key={d.id} style={{ gap: 6, paddingVertical: 8, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                    <Text preset="body" style={{ fontWeight: '900' }}>
                      {t('curriculum.dayLabel', { week: d.week, day: d.day })} — {d.title}  ·  {tag}
                    </Text>
                    <Text preset="muted">{d.focus}</Text>
                    {drillTitles ? <Text preset="muted">{t('curriculumOverview.drillsLine', { value: drillTitles })}</Text> : null}
                    <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                      <Button
                        text={btn}
                        variant={st === 'today' ? 'primary' : 'soft'}
                        onPress={() => {
                          if (st === 'upcoming' || st === 'tomorrow_locked' || st === 'locked') {
                            ;(navigation as any).navigate('CurriculumDayPreview', { dayId: d.id })
                            return
                          }
                          startDay(d.id)
                        }}
                      />
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </Card>
        ))}
    </Screen>
  )
}
