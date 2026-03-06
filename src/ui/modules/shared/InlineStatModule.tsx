import React from 'react'
import { Box, Text } from '@/ui/primitives'

type Props = {
  label: string
  value: string
  helper?: string
  emphasis?: 'normal' | 'strong'
  testID?: string
}

/**
 * Small reusable stat row (label/value), used in score cards, summaries, etc.
 */
export function InlineStatModule({ label, value, helper, emphasis = 'normal', testID }: Props) {
  return (
    <Box testID={testID} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Box style={{ flex: 1, paddingRight: 8 }}>
        <Text tone="muted" size="sm">
          {label}
        </Text>
        {helper ? (
          <Text tone="muted" size="xs">
            {helper}
          </Text>
        ) : null}
      </Box>
      <Text weight={emphasis === 'strong' ? 'bold' : 'medium'} size="sm">
        {value}
      </Text>
    </Box>
  )
}
