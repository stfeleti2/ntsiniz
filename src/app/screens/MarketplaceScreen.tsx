import React, { useMemo } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { ListRow } from '@/ui/components/kit/ListRow'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { loadMarketplaceCoaches, loadMarketplacePrograms } from '@/core/marketplace/loader'

type Props = NativeStackScreenProps<RootStackParamList, 'Marketplace'>

export function MarketplaceScreen({ navigation }: Props) {
  const coaches = useMemo(() => loadMarketplaceCoaches(), [])
  const programs = useMemo(() => loadMarketplacePrograms(), [])

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('marketplace.title')}</Text>
        <Text preset="muted">{t('marketplace.subtitle')}</Text>
      </Box>

      <Card>
        <Text preset="h2">{t('marketplace.programsTitle')}</Text>
        <Text preset="muted">{t('marketplace.programsSubtitle')}</Text>
        <Box style={{ marginTop: 10, gap: 10 }}>
          {programs.programs.map((p) => {
            const coach = coaches.coaches.find((c) => c.id === p.coachId)
            return (
              <ListRow
                key={p.id}
                title={`${p.access === 'pro' ? '🔒 ' : ''}${p.title}`}
                subtitle={`${coach?.name ?? ''}${coach ? ' · ' : ''}${p.subtitle ?? ''}`}
                leftIcon="📚"
                onPress={() => (navigation as any).navigate('ProgramDetail', { programId: p.id })}
              />
            )
          })}
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('marketplace.coachesTitle')}</Text>
        <Text preset="muted">{t('marketplace.coachesSubtitle')}</Text>
        <Box style={{ marginTop: 10, gap: 10 }}>
          {coaches.coaches.map((c) => (
            <ListRow
              key={c.id}
              title={c.name}
              subtitle={c.headline ?? ''}
              leftIcon="🧑‍🏫"
              onPress={() => (navigation as any).navigate('CoachTools', { coachId: c.id })}
            />
          ))}
        </Box>
      </Card>
    </Screen>
  )
}
