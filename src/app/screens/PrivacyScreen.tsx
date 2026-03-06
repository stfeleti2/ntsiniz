import React from 'react'
import { Linking } from 'react-native'
import Constants from 'expo-constants'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/app/navigation/types'
import { PRIVACY_TEXT } from '@/app/legal/privacyText'

type Props = NativeStackScreenProps<RootStackParamList, 'Privacy'>

export function PrivacyScreen({ navigation }: Props) {
  const extra = (Constants.expoConfig?.extra ?? {}) as any
  const privacyUrl: string = extra.privacyUrl ?? ''
  const termsUrl: string = extra.termsUrl ?? ''

  const open = async (url: string) => {
    if (!url) return
    try {
      await Linking.openURL(url)
    } catch {
      // ignore
    }
  }

  return (
    <Screen title={t('privacy.title')} scroll>
      <Box gap={12}>
        <Card tone="glow">
          <Box gap={8}>
            <Text size="lg" weight="semibold">{t('privacy.headline')}</Text>
            <Text muted>{t('privacy.summary')}</Text>
          </Box>
        </Card>

        <Card>
          <Box gap={10}>
            <Text weight="semibold">{t('privacy.linksTitle')}</Text>
            <Box gap={8}>
              <Button title={t('privacy.viewTermsInApp')} onPress={() => navigation.navigate('Terms')} />
              {!!termsUrl && <Button title={t('privacy.openTermsWeb')} variant="ghost" onPress={() => open(termsUrl)} />}
              {!!privacyUrl && <Button title={t('privacy.openPrivacyWeb')} variant="ghost" onPress={() => open(privacyUrl)} />}
            </Box>
          </Box>
        </Card>

        <Card>
          <Box gap={8}>
            <Text weight="semibold">{t('privacy.fullPolicyTitle')}</Text>
            <Text size="sm" style={{ lineHeight: 18 }}>{PRIVACY_TEXT}</Text>
          </Box>
        </Card>
      </Box>
    </Screen>
  )
}
