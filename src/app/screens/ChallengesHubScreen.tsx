import React, { useEffect, useMemo, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Share } from 'react-native'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { ListRow } from '@/ui/components/kit/ListRow'
import { Box } from '@/ui'

import { t } from '@/app/i18n'
import { getDailyChallenge, getDailyChallengeBest } from '@/core/challenges/dailyChallenge'
import { getWeeklyChallenges } from '@/core/challenges/weeklyChallenges'
import { ensureSelfPerson } from '@/core/social/peopleRepo'
import { listSubmissionsForChallenge } from '@/core/social/submissionsRepo'
import { createMySubmissionCode } from '@/core/social/shareCode'
import { isoDate } from '@/core/curriculum/progress'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'ChallengesHub'>

export function ChallengesHubScreen({ navigation }: Props) {
  const [dailyBest, setDailyBest] = useState<number | null>(null)
  const [weeklyMine, setWeeklyMine] = useState<Record<string, { score: number; completed: number; total: number }>>({})

  const daily = useMemo(() => getDailyChallenge(), [])
  const weekly = useMemo(() => getWeeklyChallenges(), [])

  useEffect(() => {
    ;(async () => {
      const me = await ensureSelfPerson()
      setDailyBest(await getDailyChallengeBest().catch(() => null))

      const out: Record<string, { score: number; completed: number; total: number }> = {}
      for (const wk of weekly.challenges) {
        const subs = await listSubmissionsForChallenge({ period: 'weekly', periodKey: weekly.weekKey, challengeId: wk.id }).catch(() => [])
        const mine = subs.find((s) => s.userId === me.id)
        const completed = (mine?.details?.completed as number) ?? 0
        const total = (mine?.details?.total as number) ?? wk.drillIds.length
        out[wk.id] = { score: mine?.score ?? 0, completed, total }
      }
      setWeeklyMine(out)
    })().catch((e) => reportUiError(e))
  }, [])

  const shareSubmission = async (sub: { period: 'daily' | 'weekly'; periodKey: string; challengeId: string; score: number; details: any }) => {
    const code = await createMySubmissionCode({
      period: sub.period,
      periodKey: sub.periodKey,
      challengeId: sub.challengeId,
      score: sub.score,
      details: sub.details ?? {},
    })
    const link = `ntsiniz://import?code=${code}`
    await Share.share({ message: `${t('share.codeIntro')}\n${link}\n\n${t('share.codeFallback')}\n${code}` })
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('challenges.title')}</Text>
        <Text preset="muted">{t('challenges.subtitle')}</Text>
      </Box>

      <Card tone="glow">
        <Text preset="h2">{t('challenges.dailyTitle')}</Text>
        <Text preset="muted">{t('challenges.dailySubtitle')}</Text>
        <Box style={{ marginTop: 8, gap: 4 }}>
          <Text preset="body" style={{ fontWeight: '900' }}>{daily.title}</Text>
          <Text preset="muted">
            {dailyBest == null ? t('challenges.targetLine', { target: daily.targetScore }) : t('challenges.bestLine', { best: Math.round(dailyBest), target: daily.targetScore })}
          </Text>
        </Box>
        <Box style={{ marginTop: 12, gap: 10 }}>
          <Button text={t('challenges.startDaily')} onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Session', params: { dailyChallenge: true } })} />
          <Button text={t('challenges.viewLeaderboard')} variant="soft" onPress={() => (navigation as any).navigate('Leaderboard', { period: 'daily', challengeId: daily.id })} />
          <Button
            text={t('challenges.shareMyScore')}
            variant="ghost"
            disabled={dailyBest == null}
            onPress={() =>
              shareSubmission({
                period: 'daily',
                periodKey: isoDate(),
                challengeId: daily.id,
                score: dailyBest ?? 0,
                details: { drillId: daily.drillId, title: daily.title, target: daily.targetScore },
              })
            }
          />
          <Button text={t('challenges.importCode')} variant="ghost" onPress={() => (navigation as any).navigate('ImportCode')} />
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('challenges.weeklyTitle')}</Text>
        <Text preset="muted">{t('challenges.weeklySubtitle', { key: weekly.weekKey })}</Text>

        <Box style={{ marginTop: 10, gap: 10 }}>
          {weekly.challenges.map((wk) => {
            const mine = weeklyMine[wk.id]
            const done = mine ? mine.completed : 0
            const total = mine ? mine.total : wk.drillIds.length
            const score = mine ? mine.score : 0
            const subtitle = done > 0 ? t('challenges.weeklyProgressLine', { done, total, score: Math.round(score) }) : wk.subtitle
            return (
              <ListRow
                key={wk.id}
                title={wk.title}
                subtitle={subtitle}
                leftIcon="⭐"
                onPress={() => (navigation as any).navigate('Leaderboard', { period: 'weekly', challengeId: wk.id })}
                right={
                  <Box style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Button text={t('challenges.start')} variant="soft" onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Session', params: { weeklyChallengeId: wk.id } })} />
                  </Box>
                }
              />
            )
          })}
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('challenges.friendsTitle')}</Text>
        <Text preset="muted">{t('challenges.friendsSubtitle')}</Text>
        <Box style={{ marginTop: 10, gap: 10 }}>
          <Button text={t('challenges.openFriends')} onPress={() => (navigation as any).navigate('Friends')} />
        </Box>
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
