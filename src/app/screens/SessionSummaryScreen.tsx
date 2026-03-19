import React, { useEffect, useMemo, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { t } from '@/app/i18n'

import { listAttemptsBySession, type Attempt } from '@/core/storage/attemptsRepo'
import { loadAllBundledPacks } from '@/core/drills/loader'
import { pickNextDrill } from '@/core/profile/nextDrill'
import { getProfile } from '@/core/storage/profileRepo'
import { RewardedBoostCard } from '@/ui/monetization/RewardedBoostCard'
import { getVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'
import { getAdaptiveJourneyState } from '@/core/guidedJourney/adaptiveStateRepo'
import { NextStepCard, PlaybackInsightCard } from '@/ui/guidedJourney'

type Props = NativeStackScreenProps<RootStackParamList, 'SessionSummary'>
const uiCopy = {
  coachNoteTitle: 'Coach note',
  progressCompareTitle: 'Progress compare',
  progressCompareBody: 'Compare your baseline against your latest session when you are ready.',
  progressCompareCta: 'Open compare progress',
}

export function SessionSummaryScreen({ navigation, route }: Props) {
  const { sessionId } = route.params
  const [attempts, setAttempts] = useState<Attempt[]>([])

  useEffect(() => {
    listAttemptsBySession(sessionId)
      .then(setAttempts)
      .catch(() => setAttempts([]))
  }, [sessionId])

  const stats = useMemo(() => {
    if (!attempts.length) return { avg: 0, best: 0, count: 0, last: null as Attempt | null }
    const scores = attempts.map((a) => a.score)
    const avg = scores.reduce((s, x) => s + x, 0) / Math.max(1, scores.length)
    const best = Math.max(...scores)
    const last = attempts[attempts.length - 1]
    return { avg: Math.round(avg), best, count: attempts.length, last }
  }, [attempts])

  const [nextDrillId, setNextDrillId] = useState<string | null>(null)
  const [voiceTip, setVoiceTip] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const pack = loadAllBundledPacks()
        const profile = await getProfile().catch(() => null)
        const [voice, adaptive] = await Promise.all([getVoiceIdentity().catch(() => null), getAdaptiveJourneyState().catch(() => null)])
        const last = stats.last
        const id = pickNextDrill(pack, profile ?? ({} as any), {
          lastDrillId: last?.drillId,
          lastScore: last?.score,
        })
        setNextDrillId(id)
        setVoiceTip(last?.metrics?.guidedJourney?.coachTip ?? adaptive?.lastRecommendedFamily?.replace(/_/g, ' ') ?? voice?.currentFocus?.[0] ?? null)
      } catch {
        setNextDrillId(null)
      }
    })()
  }, [stats.last])

  return (
    <Screen scroll background="gradient">
      <Text preset="h1">{t('results.title')}</Text>
      <Text preset="muted">{t('nextAction.resultSubtitle')}</Text>

      <Box h={12} />

      <Card>
        <Text preset="h2">{t('coach.sessionSummaryTitle') ?? 'Session summary'}</Text>
        <Box h={10} />
        <Text preset="body">{t('coach.sessionSummaryLine1') ?? 'You’re building real consistency.'}</Text>
        <Box h={10} />
        <Text preset="muted">{t('coach.sessionSummaryStats') ?? 'Stats'}</Text>
        <Text preset="body">{`Attempts: ${stats.count}`}</Text>
        <Text preset="body">{`Best: ${stats.best}`}</Text>
        <Text preset="body">{`Average: ${stats.avg}`}</Text>
      </Card>

      {voiceTip ? <PlaybackInsightCard title={uiCopy.coachNoteTitle} body={voiceTip} /> : null}

      <Box h={14} />
      <RewardedBoostCard />

      <Box h={14} />

      <Card>
        <Text preset="h2">{t('coach.nextActionTitle')}</Text>
        <Text preset="muted" style={{ marginTop: 6 }}>
          {t('coach.nextActionSubtitle')}
        </Text>
        <Box h={10} />
        <Button
          text={t('nextAction.tryNext')}
          variant="primary"
          onPress={() => {
            if (nextDrillId) navigation.replace('Drill', { sessionId, drillId: nextDrillId })
            else navigation.replace('Results', { sessionId })
          }}
          testID="btn-session-summary-next"
        />
        <Box h={8} />
        <Button
          text={t('common.finish')}
          variant="soft"
          onPress={() => navigation.replace('Results', { sessionId })}
          testID="btn-session-summary-results"
        />
      </Card>

      <NextStepCard title={uiCopy.progressCompareTitle} body={uiCopy.progressCompareBody} cta={uiCopy.progressCompareCta} onPress={() => navigation.navigate('CompareProgress')} />
    </Screen>
  )
}
