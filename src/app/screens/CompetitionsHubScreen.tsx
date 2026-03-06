import React, { useMemo } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { ListRow } from '@/ui/components/kit/ListRow'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { loadCompetitionsPack } from '@/core/competitions/loader'
import { isSeasonActive, getActiveRound } from '@/core/competitions/season'

type Props = NativeStackScreenProps<RootStackParamList, 'CompetitionsHub'>

export function CompetitionsHubScreen({ navigation }: Props) {
  const pack = useMemo(() => loadCompetitionsPack(), [])
  const now = Date.now()

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('competitions.title')}</Text>
        <Text preset="muted">{t('competitions.subtitle')}</Text>
      </Box>

      {pack.seasons.map((s) => {
        const active = isSeasonActive(s, now)
        return (
          <Card key={s.id} tone={active ? 'glow' : 'default'}>
            <Text preset="h2">{s.title}</Text>
            <Text preset="muted">{s.subtitle || (active ? t('competitions.seasonActive') : t('competitions.seasonPast'))}</Text>
            <Box style={{ marginTop: 10, gap: 10 }}>
              {s.competitions.map((c) => {
                const ar = getActiveRound(c, now)
                const line = ar ? t('competitions.activeRoundLine', { title: ar.title }) : t('competitions.noActiveRound')
                return (
                  <ListRow
                    key={c.id}
                    title={c.title}
                    subtitle={`${c.subtitle ?? ''}${c.subtitle ? ' · ' : ''}${line}`}
                    leftIcon="🏆"
                    onPress={() => (navigation as any).navigate('CompetitionDetail', { competitionId: c.id, seasonId: s.id })}
                  />
                )
              })}
            </Box>
          </Card>
        )
      })}

      <Box style={{ height: 16 }} />
      <Text preset="muted">{t('competitions.offlineNote')}</Text>
    </Screen>
  )
}
