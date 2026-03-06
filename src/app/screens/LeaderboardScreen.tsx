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

import { isoDate } from '@/core/curriculum/progress'
import { getIsoWeekKey } from '@/core/time/week'
import { getDailyChallenge } from '@/core/challenges/dailyChallenge'
import { getWeeklyChallengeById } from '@/core/challenges/weeklyChallenges'
import { getLeaderboard } from '@/core/challenges/leaderboards'
import { ensureSelfPerson } from '@/core/social/peopleRepo'
import { createMySubmissionCode } from '@/core/social/shareCode'
import type { ChallengeSubmission } from '@/core/social/types'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'Leaderboard'>

export function LeaderboardScreen({ navigation, route }: Props) {
  const { period, challengeId } = route.params
  const periodKey = useMemo(() => (period === 'daily' ? isoDate() : getIsoWeekKey()), [period])
  const [rows, setRows] = useState<ChallengeSubmission[]>([])
  const [meId, setMeId] = useState<string | null>(null)

  const header = useMemo(() => {
    if (period === 'daily') {
      const c = getDailyChallenge()
      return { title: t('leaderboard.dailyTitle'), subtitle: `${c.title} · ${periodKey}`, hint: t('leaderboard.offlineHint') }
    }
    const wk = getWeeklyChallengeById(challengeId)
    return { title: t('leaderboard.weeklyTitle'), subtitle: `${wk?.title ?? challengeId} · ${periodKey}`, hint: t('leaderboard.offlineHint') }
  }, [period, challengeId, periodKey])

  useEffect(() => {
    ;(async () => {
      const me = await ensureSelfPerson()
      setMeId(me.id)
      const r = await getLeaderboard({ period, periodKey, challengeId })
      setRows(r)
    })().catch((e) => reportUiError(e))
  }, [period, periodKey, challengeId])

  const myRow = useMemo(() => rows.find((r) => r.userId === meId) ?? null, [rows, meId])

  const shareMy = async () => {
    if (!myRow) return
    const code = await createMySubmissionCode({
      period: myRow.period,
      periodKey: myRow.periodKey,
      challengeId: myRow.challengeId,
      score: myRow.score,
      details: myRow.details ?? {},
    })
    const link = `ntsiniz://import?code=${code}`
    await Share.share({ message: `${t('share.codeIntro')}\n${link}\n\n${t('share.codeFallback')}\n${code}` })
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{header.title}</Text>
        <Text preset="muted">{header.subtitle}</Text>
        <Text preset="muted">{header.hint}</Text>
      </Box>

      <Card tone="elevated">
        <Text preset="h2">{t('leaderboard.yourLineTitle')}</Text>
        <Text preset="muted">{myRow ? t('leaderboard.yourLineBody', { score: Math.round(myRow.score) }) : t('leaderboard.yourLineEmpty')}</Text>
        <Box style={{ marginTop: 12, gap: 10 }}>
          <Button text={t('leaderboard.shareMyEntry')} disabled={!myRow} onPress={shareMy} />
          <Button text={t('leaderboard.importEntry')} variant="soft" onPress={() => (navigation as any).navigate('ImportCode')} />
          <Button text={t('leaderboard.openFriends')} variant="ghost" onPress={() => (navigation as any).navigate('Friends')} />
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('leaderboard.tableTitle')}</Text>
        <Text preset="muted">{t('leaderboard.tableSubtitle')}</Text>
        <Box style={{ marginTop: 10, gap: 10 }}>
          {rows.length ? (
            rows.slice(0, 25).map((r, idx) => (
              <ListRow
                key={r.id}
                title={`${idx + 1}. ${r.displayName}${r.userId === meId ? ' (You)' : ''}`}
                subtitle={t('leaderboard.scoreLine', { score: Math.round(r.score) })}
                leftIcon={idx === 0 ? '🏆' : '🎯'}
              />
            ))
          ) : (
            <Text preset="muted">{t('leaderboard.empty')}</Text>
          )}
        </Box>
      </Card>

      <Card tone="elevated">
        <Text preset="h2">{t('leaderboard.globalTitle')}</Text>
        <Text preset="muted">{t('leaderboard.globalSubtitle')}</Text>
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
