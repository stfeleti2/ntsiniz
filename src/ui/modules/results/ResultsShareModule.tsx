import React from 'react'
import { t } from '@/app/i18n'
import { Card } from '@/ui/components/kit/Card'
import { Box, Stack, Text } from '@/ui/primitives'
import { ProgressCard } from '@/core/share/ProgressCard'
import { ShareActionsModule } from '@/ui/modules/shared/ShareActionsModule'

/**
 * Presentational share card for Results.
 * - Capturing/sharing is handled by the screen via `onShare`.
 * - `cardRef` is forwarded to ProgressCard for screenshot share.
 */
export function ResultsShareModule({
  cardRef,
  scoreNow,
  delta,
  onShare,
  toast,
  testID,
}: {
  cardRef: React.Ref<any>
  scoreNow: number
  delta?: number
  onShare: () => void
  toast?: string | null
  testID?: string
}) {
  return (
    <Card testID={testID}>
      <Stack gap={12}>
        <Text size="lg" weight="bold">
          {t('results.shareProgressTitle')}
        </Text>

        <Box style={{ alignItems: 'center' }}>
          <ProgressCard ref={cardRef} stats={{ label: t('results.todayLabel'), scoreNow, delta }} />
        </Box>

        <ShareActionsModule
          primaryLabel={t('results.share')}
          onPrimary={onShare}
          toast={toast}
          testID={testID ? `${testID}.actions` : undefined}
        />
      </Stack>
    </Card>
  )
}
