import React from 'react'
import { t } from '@/app/i18n'
import { Box, Text } from '@/ui/primitives'
import { Button } from '@/ui/components/kit'

export type JourneyMission = {
  id: string
  title: string
  subtitle?: string
  focus?: string
  focusType?: string
  drills?: string[]
}

type Props = {
  mission: JourneyMission
  onStartMission?: (mission: JourneyMission) => void
  testID?: string
}

/**
 * UI-only block for the "Next Up" mission content.
 * No business logic here; just props + callbacks.
 */
export function JourneyNextUpMissionModule({ mission, onStartMission, testID }: Props) {
  return (
    <Box style={{ gap: 6 }} testID={testID}>
      <Text size="md" weight="bold">
        {mission.title}
      </Text>
      {mission.subtitle ? (
        <Text tone="muted" size="sm">
          {mission.subtitle}
        </Text>
      ) : null}
      <Box style={{ marginTop: 10 }}>
        <Button
          label={t('journey.startMission')}
          onPress={() => onStartMission?.(mission)}
          testID={testID ? `${testID}.start` : undefined}
        />
      </Box>
    </Box>
  )
}
