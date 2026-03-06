import React, { useMemo } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { ListRow } from '@/ui/components/kit/ListRow'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { loadCompetitionsPack } from '@/core/competitions/loader'
import { isRoundOpen } from '@/core/competitions/season'

type Props = NativeStackScreenProps<RootStackParamList, 'CompetitionDetail'>

export function CompetitionDetailScreen({ navigation, route }: Props) {
  const { competitionId, seasonId } = route.params
  const pack = useMemo(() => loadCompetitionsPack(), [])
  const season = pack.seasons.find((s) => s.id === seasonId)
  const comp = season?.competitions.find((c) => c.id === competitionId)
  const now = Date.now()

  if (!season || !comp) {
    return (
      <Screen scroll background="gradient">
        <Text preset="h1">{t('competitions.notFound')}</Text>
        <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
      </Screen>
    )
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{comp.title}</Text>
        <Text preset="muted">{comp.subtitle ?? season.title}</Text>
      </Box>

      <Card>
        <Text preset="h2">{t('competitions.rulesTitle')}</Text>
        <Box style={{ marginTop: 10, gap: 6 }}>
          {(comp.rules ?? []).map((r, idx) => (
            <Text key={idx} preset="muted">{t('common.bullet', { text: r })}</Text>
          ))}
          {!comp.rules?.length ? <Text preset="muted">{t('competitions.rulesDefault')}</Text> : null}
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('competitions.roundsTitle')}</Text>
        <Text preset="muted">{t('competitions.roundsSubtitle')}</Text>
        <Box style={{ marginTop: 10, gap: 10 }}>
          {comp.rounds.map((r) => {
            const open = isRoundOpen(r, now)
            return (
              <ListRow
                key={r.id}
                title={r.title}
                subtitle={open ? t('competitions.roundOpen') : t('competitions.roundClosed')}
                leftIcon={open ? '🟢' : '⚪'}
                onPress={() => (navigation as any).navigate('CompetitionLeaderboard', { competitionId: comp.id, roundId: r.id })}
                right={
                  <Button
                    text={t('competitions.submit')}
                    variant={open ? 'primary' : 'soft'}
                    disabled={!open}
                    onPress={() => (navigation as any).navigate('CompetitionSubmit', { competitionId: comp.id, seasonId: season.id, roundId: r.id })}
                  />
                }
              />
            )
          })}
        </Box>
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
