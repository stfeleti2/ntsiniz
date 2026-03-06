import React from 'react'
import type { Attempt } from '@/core/storage/attemptsRepo'
import { t } from '@/app/i18n'
import { Box, Pressable, Stack, Text } from '@/ui/primitives'
import { TakeBadge } from '@/ui/patterns'

export type AttemptRowCompactModuleProps = {
  attempt: Attempt
  index: number
  isBest: boolean
  drillTitleById?: (drillId: string) => string
  onPress?: () => void
  parentTestID?: string
}

/** Compact attempt row (no waveform). Useful for low-end devices and dense lists. */
export function AttemptRowCompactModule({
  attempt,
  index,
  isBest,
  drillTitleById,
  onPress,
  parentTestID,
}: AttemptRowCompactModuleProps) {
  const title = drillTitleById ? drillTitleById(attempt.drillId) : attempt.drillId
  const dateLabel = new Date(attempt.createdAt).toLocaleDateString()
  const score = Math.round(attempt.score)

  const Container: any = onPress ? Pressable : Box

  return (
    <Container
      testID={parentTestID ? `${parentTestID}.item.${index}` : undefined}
      {...(onPress ? { onPress, accessibilityRole: 'button' } : null)}
      style={{ paddingVertical: 10, paddingHorizontal: 12 }}
    >
      <Stack direction="horizontal" align="center" justify="space-between" gap={12}>
        <Box style={{ flex: 1, gap: 2 }}>
          <Text weight="bold">{title}</Text>
          <Text tone="muted" size="sm">
            {t('results.attemptMeta', { date: dateLabel })}
          </Text>
        </Box>
        <Stack direction="horizontal" align="center" gap={10}>
          <Text weight="bold">{t('results.scoreChip', { score })}</Text>
          {isBest ? <TakeBadge status="best" /> : null}
        </Stack>
      </Stack>
    </Container>
  )
}
