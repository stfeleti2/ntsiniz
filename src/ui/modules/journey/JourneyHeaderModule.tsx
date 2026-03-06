import React from 'react'
import { t } from '@/app/i18n'
import { Card } from '@/ui/components/kit/Card'
import { Button } from '@/ui/components/kit/Button'
import { Stack, Text } from '@/ui/primitives'

export type JourneyHeaderTab = 'map' | 'proof'

export function JourneyHeaderModule({
  tab,
  onTab,
  onOpenLab,
  testID,
}: {
  tab: JourneyHeaderTab
  onTab: (tab: JourneyHeaderTab) => void
  onOpenLab?: () => void
  testID?: string
}) {
  return (
    <Card testID={testID}>
      <Stack gap={10}>
        <Text size="xl" weight="bold">
          {t('journey.title')}
        </Text>
        <Text tone="muted">{t('journey.subtitle')}</Text>

        <Stack direction="horizontal" gap={10}>
          <Button
            label={t('journey.tabs.map')}
            variant={tab === 'map' ? 'primary' : 'secondary'}
            onPress={() => onTab('map')}
            testID={testID ? `${testID}.map` : undefined}
          />
          <Button
            label={t('journey.tabs.proof')}
            variant={tab === 'proof' ? 'primary' : 'secondary'}
            onPress={() => onTab('proof')}
            testID={testID ? `${testID}.proof` : undefined}
          />
        </Stack>

        {__DEV__ && onOpenLab ? (
          <Button label={t('dev.openComponentLab')} variant="ghost" onPress={onOpenLab} />
        ) : null}
      </Stack>
    </Card>
  )
}
