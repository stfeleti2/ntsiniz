import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { listSessionAggregates } from '@/core/storage/sessionsRepo'
import { computeWeeklyReport } from '@/core/report/weeklyReport'
import { ShareCard } from '@/ui/share/ShareCard'
import { shareCapturedCard } from '@/ui/share/shareCardCapture'
import type { RootStackParamList } from '@/app/navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'WeeklyReport'>

export function WeeklyReportScreen({ navigation }: Props) {
  const [view, setView] = useState<any>(null)
  const cardRef = useRef<any>(null)

  useEffect(() => {
    ;(async () => {
      const aggs = await listSessionAggregates(90)
      const v = await computeWeeklyReport({ aggs, endMs: Date.now() })
      setView(v)
    })()
  }, [])

  const share = async () => {
    if (!view) return
    await shareCapturedCard(cardRef, `weekly_report_${Date.now()}.png`)
  }

  const badges = useMemo(() => view?.cardStats?.badges ?? [], [view])

  return (
    <Screen scroll background="hero">
      <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text preset="h1">{t('weekly.title') ?? 'Weekly report'}</Text>
        <Button text={t('common.close') ?? 'Close'} variant="ghost" onPress={() => navigation.goBack()} />
      </Box>

      {!view ? (
        <Card tone="elevated"><Text preset="muted">{t('common.loading') ?? 'Loading…'}</Text></Card>
      ) : (
        <>
          <Card tone="glow">
            <Text preset="h2">{view.cardStats.weekLabel}</Text>
            <Text preset="muted">
              {(t('weekly.summary', {
                sessions: view.cardStats.sessions,
                days: view.cardStats.activeDays,
                avg: Math.round(view.cardStats.avgScore),
                best: Math.round(view.cardStats.bestScore),
              }) as any) ?? `${view.cardStats.sessions} sessions • ${view.cardStats.activeDays} days • Avg ${Math.round(view.cardStats.avgScore)} • Best ${Math.round(view.cardStats.bestScore)}`}
            </Text>
            <Box style={{ height: 10 }} />
            <Button text={t('weekly.share') ?? 'Share progress'} onPress={share} />
          </Card>

          <Box style={{ opacity: 0.001, height: 1 }} />
          <ShareCard ref={cardRef} title={t('brand.name')} subtitle={view.cardStats.weekLabel}>
            <Text preset="h2">{t('weekly.cardTitle') ?? 'My progress this week'}</Text>
            <Text preset="muted">{`${Math.round(view.cardStats.avgScore)} avg • ${Math.round(view.cardStats.bestScore)} best`}</Text>
            <Box style={{ height: 10 }} />
            {badges.map((b: any, idx: number) => (
              <Text key={idx} preset="muted">{`${b.emoji} ${b.text}`}</Text>
            ))}
          </ShareCard>
        </>
      )}
    </Screen>
  )
}
