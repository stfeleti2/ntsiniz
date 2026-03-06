import React from 'react'
import { Box, Text } from '@/ui/primitives'

type Props = {
  label: string
  value: string
  tone?: 'muted' | 'default'
  testID?: string
}

export function ScoreKpiRowModule({ label, value, tone = 'muted', testID }: Props) {
  return (
    <Box
      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
      accessibilityRole="text"
      testID={testID}
    >
      <Text tone={tone} size="sm">
        {label}
      </Text>
      <Text tone={tone} size="sm" weight="bold">
        {value}
      </Text>
    </Box>
  )
}
