import React, { useEffect, useMemo, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Card } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import type { RootStackParamList } from '../navigation/types'
import { listOrphanSavedTakes } from '@/core/storage/takeFilesRepo'
import { t } from '@/app/i18n'
import { useSoundPlayback } from '@/app/audio/useSoundPlayback'

type Props = NativeStackScreenProps<RootStackParamList, 'RecoveredTakes'>

export function RecoveredTakesScreen({ navigation }: Props) {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listOrphanSavedTakes>>>([])
  const [activeUri, setActiveUri] = useState<string | null>(null)

  const { state, toggle } = useSoundPlayback(activeUri)

  useEffect(() => {
    ;(async () => {
      setRows(await listOrphanSavedTakes(50).catch(() => []))
    })()
  }, [])

  const header = useMemo(() => {
    if (!rows.length) return t('recovered.none', 'No recovered takes found.')
    return t('recovered.title', 'Recovered takes')
  }, [rows.length])

  return (
    <Screen title={t('recovered.screenTitle', 'Recovered Takes')} onBack={() => navigation.goBack()}>
      <Box gap={12}>
        <Text>{header}</Text>

        {rows.map((r) => {
          const isActive = activeUri === r.path
          const label = isActive && state.isPlaying ? t('common.pause', 'Pause') : t('common.play', 'Play')

          return (
            <Card key={r.path}>
              <Box gap={8}>
                <Text numberOfLines={1}>{r.path.split('/').pop() ?? r.path}</Text>
                <Text size="sm" tone="muted">
                  {t('recovered.status', 'Status')}: {r.status}
                </Text>

                <Box row gap={10}>
                  <Button
                    onPress={() => {
                      if (isActive) toggle()
                      else setActiveUri(r.path)
                    }}
                    variant="primary"
                  >
                    {label}
                  </Button>

                  <Button
                    onPress={() => {
                      setActiveUri(r.path)
                    }}
                    variant="secondary"
                  >
                    {t('common.open', 'Open')}
                  </Button>
                </Box>
              </Box>
            </Card>
          )
        })}
      </Box>
    </Screen>
  )
}
