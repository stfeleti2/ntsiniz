import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { ListRow } from '@/ui/components/kit/ListRow'
import { Box } from '@/ui'
import { t } from '@/app/i18n'

import { listDuets } from '@/core/duets/duetsRepo'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'DuetsHub'>

export function DuetsHubScreen({ navigation }: Props) {
  const [items, setItems] = useState<any[]>([])

  const refresh = async () => {
    const d = await listDuets(80)
    setItems(d)
  }

  useEffect(() => {
    refresh().catch((e) => reportUiError(e))
    const id = setInterval(() => refresh().catch(() => {}), 6000)
    return () => clearInterval(id)
  }, [])

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('duets.title')}</Text>
        <Text preset="muted">{t('duets.subtitle')}</Text>
      </Box>

      <Card tone="glow">
        <Text preset="h2">{t('duets.actionsTitle')}</Text>
        <Text preset="muted">{t('duets.actionsSubtitle')}</Text>
        <Box style={{ marginTop: 12, gap: 10 }}>
          <Button text={t('duets.createInvite')} onPress={() => navigation.navigate('DuetCreate')} />
          <Button text={t('duets.importInvite')} variant="soft" onPress={() => navigation.navigate('DuetImport')} />
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('duets.listTitle')}</Text>
        <Text preset="muted">{t('duets.listSubtitle')}</Text>
        <Box style={{ marginTop: 10, gap: 10 }}>
          {items.length ? (
            items.map((d) => {
              const statusLabel =
                d.status === 'mixed'
                  ? t('duets.status.mixed')
                  : d.status === 'recorded'
                    ? t('duets.status.recorded')
                    : t('duets.status.invited')
              return (
                <ListRow
                  key={d.id}
                  title={d.title}
                  subtitle={`${d.inviterName} · ${statusLabel} · ${new Date(d.createdAt).toLocaleDateString()}`}
                  leftIcon={d.status === 'mixed' ? '🎶' : d.status === 'recorded' ? '🎙️' : '🤝'}
                  onPress={() => navigation.navigate('DuetSession', { duetId: d.id })}
                />
              )
            })
          ) : (
            <Text preset="muted">{t('duets.empty')}</Text>
          )}
        </Box>
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
