import React from 'react'
import { useWindowDimensions } from 'react-native'
import { Card } from './Card'
import { Text } from './Typography'
import { Button } from './Button'
import { Box } from '@/ui'

export type NextActionBarProps = {
  title: string
  subtitle?: string
  primaryLabel: string
  primaryTestID?: string
  onPrimary: () => void
  secondaryLabel?: string
  secondaryTestID?: string
  onSecondary?: () => void
  testID?: string
}

/**
 * Persistent “What now?” affordance.
 *
 * Principles:
 * - One clear next step
 * - Works offline
 * - Avoids heavy rendering
 */
export function NextActionBar(props: NextActionBarProps) {
  const { title, subtitle, primaryLabel, onPrimary, secondaryLabel, onSecondary, testID } = props
  const { width } = useWindowDimensions()
  const stackButtons = width < 420
  return (
    <Card testID={testID ?? 'next.action'} tone="glow">
      <Box style={{ gap: 10 }}>
        <Box style={{ gap: 4 }}>
          <Text preset="h3">{title}</Text>
          {subtitle ? <Text preset="muted">{subtitle}</Text> : null}
        </Box>

        <Box style={{ flexDirection: stackButtons ? 'column' : 'row', gap: 8, flexWrap: 'wrap' }}>
          <Button text={primaryLabel} testID={props.primaryTestID} onPress={onPrimary} />
          {secondaryLabel && onSecondary ? <Button text={secondaryLabel} testID={props.secondaryTestID} variant="ghost" onPress={onSecondary} /> : null}
        </Box>
      </Box>
    </Card>
  )
}
