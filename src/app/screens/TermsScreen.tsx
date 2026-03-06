import React from 'react'
import { ScrollView } from 'react-native'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { TERMS_TEXT } from '@/app/legal/termsText'

export function TermsScreen() {
  return (
    <Screen title={t('legal.termsTitle')} scroll>
      <Box gap={12}>
        <Card>
          <Box gap={8}>
            <Text size="lg" weight="semibold">{t('legal.termsHeadline')}</Text>
            <Text muted>{t('legal.termsIntro')}</Text>
          </Box>
        </Card>

        <Card>
          <ScrollView>
            <Text size="sm" style={{ lineHeight: 18 }}>{TERMS_TEXT}</Text>
          </ScrollView>
        </Card>
      </Box>
    </Screen>
  )
}
