import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Share } from 'react-native'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { createMyCoachShareCode } from '@/core/marketplace/shareCodes'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'CoachTools'>

export function CoachToolsScreen({ navigation }: Props) {
  const [code, setCode] = useState<string>('')

  useEffect(() => {
    createMyCoachShareCode()
      .then(setCode)
      .catch((e) => reportUiError(e))
  }, [])

  const share = async () => {
    if (!code) return
    const link = `ntsiniz://coach?code=${code}`
    await Share.share({ message: `${t('marketplace.coachShareIntro')}
${link}

${t('share.codeFallback')}
${code}` })
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('marketplace.coachToolsTitle')}</Text>
        <Text preset="muted">{t('marketplace.coachToolsSubtitle')}</Text>
      </Box>

      <Card tone="glow">
        <Text preset="h2">{t('marketplace.coachCodeTitle')}</Text>
        <Text preset="muted">{t('marketplace.coachCodeBody')}</Text>
        <Box style={{ marginTop: 10, gap: 10 }}>
          <Text preset="body" style={{ fontWeight: '900' }}>{code || t('common.loading')}</Text>
          <Button text={t('marketplace.shareCoachCode')} onPress={() => share().catch(() => {})} />
          <Button text={t('marketplace.importFeedbackPack')} variant="soft" onPress={() => (navigation as any).navigate('FeedbackImport')} />
          <Button text={t('marketplace.openFeedbackInbox')} variant="soft" onPress={() => (navigation as any).navigate('FeedbackInbox')} />
        </Box>
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
