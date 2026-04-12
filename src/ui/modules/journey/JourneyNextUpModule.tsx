import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { t } from '@/app/i18n'
import { Box, Text } from '@/ui/primitives'
import { Card } from '@/ui/components/kit'
import { useTheme } from '@/theme/useTheme'

import { JourneyNextUpMissionModule, type JourneyMission } from './JourneyNextUpMissionModule'

export type JourneyProgress = { done: number; total: number; pct: number }

type Props = {
  progress: JourneyProgress
  mission: JourneyMission | null
  onStartMission: (mission: JourneyMission) => void
  testID?: string
}

export function JourneyNextUpModule({ progress, mission, onStartMission, testID }: Props) {
  const theme = useTheme()

  return (
    <Card
      testID={testID}
      style={{
        borderWidth: 1,
        borderColor: theme.colors.line,
      }}
    >
      <Text size="lg" weight="bold">
        {t('journey.nextUpTitle')}
      </Text>
      <ProgressRow done={progress.done} total={progress.total} pct={progress.pct} />

      {!mission ? (
        <Text tone="muted" size="sm">
          {t('journey.unlockMap')}
        </Text>
      ) : (
        <JourneyNextUpMissionModule
          mission={mission}
          onStartMission={onStartMission}
          testID={testID ? `${testID}.mission` : undefined}
        />
      )}
    </Card>
  )
}

function ProgressRow({ done, total, pct }: { done: number; total: number; pct: number }) {
  const theme = useTheme()

  return (
    <Box style={{ gap: 6, marginTop: 6 }}>
      <Box style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text tone="muted" size="sm">
          {t('journey.phase1')}
        </Text>
        <Text tone="muted" size="sm" weight="bold">
          {done}/{total}
        </Text>
      </Box>
      <Box
        style={{
          height: 10,
          borderRadius: 999,
          backgroundColor: theme.colors.card,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={theme.gradients.primary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 10, width: `${Math.max(6, Math.round(pct * 100))}%` }}
        />
      </Box>
    </Box>
  )
}
