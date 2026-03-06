import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Input } from '@/ui/components/kit/Input'
import { Box } from '@/ui'
import { useSnackbar } from '@/ui/components/kit/Snackbar'
import { t } from '@/app/i18n'

import { importShareCode } from '@/core/social/shareCode'

type Props = NativeStackScreenProps<RootStackParamList, 'ImportCode'>

export function ImportCodeScreen({ navigation, route }: Props) {
  const snackbar = useSnackbar()
  const [code, setCode] = useState('')

  useEffect(() => {
    const c = (route.params as any)?.code
    if (c && typeof c === 'string') setCode(c)
  }, [route.params])

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('import.title')}</Text>
        <Text preset="muted">{t('import.subtitle')}</Text>
      </Box>

      <Card tone="glow">
        <Input value={code} onChangeText={setCode} label={t('import.codeLabel')} placeholder={t('import.codePlaceholder')} />
        <Box style={{ marginTop: 12, gap: 10 }}>
          <Button
            text={t('import.importButton')}
            disabled={!code.trim()}
            onPress={async () => {
              try {
                const res = await importShareCode(code.trim())
                snackbar.show(res.message)
                navigation.goBack()
              } catch (e: any) {
                snackbar.show(e?.message ?? t('import.invalid'))
              }
            }}
          />
          <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
        </Box>
      </Card>
    </Screen>
  )
}
