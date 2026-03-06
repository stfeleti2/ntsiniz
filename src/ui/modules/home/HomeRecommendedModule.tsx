import React from 'react'
import { t } from '@/app/i18n'
import { Card } from '@/ui/components/kit/Card'
import { Button } from '@/ui/components/kit/Button'
import { Stack, Text } from '@/ui/primitives'

export type NextMission = {
  id: string
  title: string
  subtitle: string
  focusType?: string
}

export function HomeRecommendedModule({
  mission,
  onStartMission,
  onOpenJourney,
  testID,
}: {
  mission: NextMission | null
  onStartMission: (mission: NextMission) => void
  onOpenJourney: () => void
  testID?: string
}) {
  return (
    <Card testID={testID}>
      <Stack gap={10}>
        <Text size="lg" weight="bold">
          {t('home.nextMissionTitle')}
        </Text>

        {!mission ? (
          <Text tone="muted">{t('home.unlockJourney')}</Text>
        ) : (
          <>
            <Text weight="bold">{mission.title}</Text>
            <Text tone="muted">{mission.subtitle}</Text>
            <Button
              label={t('home.startMission')}
              onPress={() => onStartMission(mission)}
              testID={testID ? `${testID}.start` : undefined}
            />
            <Button
              label={t('home.seeFullMap')}
              variant="ghost"
              onPress={onOpenJourney}
              testID={testID ? `${testID}.journey` : undefined}
            />
          </>
        )}
      </Stack>
    </Card>
  )
}
