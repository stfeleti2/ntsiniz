import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { ListRow } from '@/ui/components/kit/ListRow'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { listCompetitionLeaderboard, getMyCompetitionSubmission } from '@/core/competitions/repo'
import { ensureSelfPerson } from '@/core/social/peopleRepo'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'CompetitionLeaderboard'>

export function CompetitionLeaderboardScreen({ navigation, route }: Props) {
  const { competitionId, roundId } = route.params
  const [rows, setRows] = useState<any[]>([])
  const [mine, setMine] = useState<any | null>(null)

  const refresh = async () => {
    const me = await ensureSelfPerson()
    setRows(await listCompetitionLeaderboard({ competitionId, roundId, limit: 50 }))
    setMine(await getMyCompetitionSubmission({ competitionId, roundId, userId: me.id }))
  }

  useEffect(() => {
    refresh().catch((e) => reportUiError(e))
  }, [competitionId, roundId])

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('competitions.leaderboardTitle')}</Text>
        <Text preset="muted">{t('competitions.leaderboardSubtitle')}</Text>
      </Box>

      {mine ? (
        <Card tone="glow">
          <Text preset="h2">{t('competitions.myEntry')}</Text>
          <Text preset="muted">{t('competitions.myEntryLine', { score: Math.round(mine.score) })}</Text>
          <Box style={{ marginTop: 10 }}>
            <Button text={t('competitions.viewClip')} variant="soft" onPress={() => (navigation as any).navigate('PerformancePreview', { clipId: mine.clipId })} />
          </Box>
        </Card>
      ) : null}

      <Card>
        <Text preset="h2">{t('competitions.topTitle')}</Text>
        <Box style={{ marginTop: 10, gap: 10 }}>
          {rows.length ? (
            rows.map((r, idx) => (
              <ListRow
                key={r.id}
                title={`${idx + 1}. ${r.displayName}`}
                subtitle={t('competitions.scoreLine', { score: Math.round(r.score) })}
                leftIcon={idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}
                onPress={() => (navigation as any).navigate('PerformancePreview', { clipId: r.clipId })}
              />
            ))
          ) : (
            <Text preset="muted">{t('competitions.empty')}</Text>
          )}
        </Box>
      </Card>

      <Box style={{ gap: 10 }}>
        <Button text={t('competitions.refresh')} variant="soft" onPress={() => refresh().catch(() => {})} />
        <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
      </Box>
    </Screen>
  )
}
