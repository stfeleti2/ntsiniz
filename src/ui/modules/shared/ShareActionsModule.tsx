import React from 'react'
import { Box, Text } from '@/ui/primitives'
import { Button } from '@/ui/components/kit'

type Props = {
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  toast?: string | null
  testID?: string
}

export function ShareActionsModule({ primaryLabel, onPrimary, secondaryLabel, onSecondary, toast, testID }: Props) {
  return (
    <Box style={{ gap: 10 }} testID={testID}>
      <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <Button label={primaryLabel} onPress={onPrimary} testID={testID ? `${testID}.primary` : undefined} />
        {secondaryLabel && onSecondary ? (
          <Button
            label={secondaryLabel}
            variant="secondary"
            onPress={onSecondary}
            testID={testID ? `${testID}.secondary` : undefined}
          />
        ) : null}
      </Box>
      {toast ? (
        <Box style={{ alignItems: 'center' }}>
          <Text tone="muted" size="sm">
            {toast}
          </Text>
        </Box>
      ) : null}
    </Box>
  )
}
