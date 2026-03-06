import React from 'react'
import { t } from '@/app/i18n'
import { Card } from '@/ui/components/kit/Card'
import { Box, Stack, Text } from '@/ui/primitives'
import { ScoreKpiRowModule } from '@/ui/modules/shared/ScoreKpiRowModule'

export type ResultsMilestones = {
  day7?: string
  day30?: string
}

/**
 * Presentational score card for Results.
 * - No business logic.
 * - Callers can inject decorations (e.g. SparkleBurst) via `scoreDecoration`.
 */
export function ResultsScoreModule({
  score,
  deltaValue,
  milestones,
  scoreDecoration,
  testID,
}: {
  score: number
  deltaValue: string
  milestones?: ResultsMilestones
  scoreDecoration?: React.ReactNode
  testID?: string
}) {
  return (
    <Card testID={testID}>
      <Stack gap={10}>
        <Text size="lg" weight="bold">
          {t('results.scoreTitle')}
        </Text>

        <Box style={{ position: 'relative', alignSelf: 'flex-start' }}>
          {scoreDecoration}
          <Text size="2xl" weight="bold">
            {Math.round(score)}
          </Text>
        </Box>

        <ScoreKpiRowModule label={t('results.baselineLabel')} value={deltaValue} testID={testID ? `${testID}.delta` : undefined} />

        {milestones?.day7 ? (
          <ScoreKpiRowModule
            label={t('results.day7Label')}
            value={milestones.day7}
            testID={testID ? `${testID}.day7` : undefined}
          />
        ) : null}
        {milestones?.day30 ? (
          <ScoreKpiRowModule
            label={t('results.day30Label')}
            value={milestones.day30}
            testID={testID ? `${testID}.day30` : undefined}
          />
        ) : null}
      </Stack>
    </Card>
  )
}
