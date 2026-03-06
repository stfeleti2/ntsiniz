import React from 'react'
import { t } from '@/app/i18n'
import { Card } from '@/ui/components/kit/Card'
import { Button } from '@/ui/components/kit/Button'
import { Badge } from '@/ui/components/kit/Badge'
import { Box, Stack, Text } from '@/ui/primitives'

export type HomeHeroStats = {
  streakDays: number
  lastScore: number
  last7Avg: number
  bestScore: number
}

export function HomeHeroModule({
  stats,
  onStartSession,
  onOpenTuner,
  testID,
}: {
  stats: HomeHeroStats
  onStartSession: () => void
  onOpenTuner: () => void
  testID?: string
}) {
  return (
    <Card testID={testID}>
      <Stack gap={10}>
        <Box>
          <Text size="lg" weight="bold">
            {t('home.vibeTitle')}
          </Text>
          <Text tone="muted" size="sm">
            {t('home.todaySubtitle')}
          </Text>
        </Box>

        <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Badge label={t('home.pill.streakDay', { days: stats.streakDays })} />
          <Badge label={t('home.pill.lastScore', { value: stats.lastScore })} tone="success" />
          <Badge label={t('home.pill.last7Avg', { value: stats.last7Avg })} tone="warning" />
          <Badge label={t('home.pill.bestScore', { value: stats.bestScore })} />
        </Box>

        <Stack gap={10}>
          <Button label={t('home.startDailySession')} onPress={onStartSession} testID={testID ? `${testID}.start` : undefined} />
          <Button
            label={t('home.openTuner')}
            variant="secondary"
            onPress={onOpenTuner}
            testID={testID ? `${testID}.tuner` : undefined}
          />
        </Stack>
      </Stack>
    </Card>
  )
}
