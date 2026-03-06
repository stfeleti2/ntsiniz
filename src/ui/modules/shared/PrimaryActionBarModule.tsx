import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import { Box } from '@/ui/primitives'
import { Button } from '@/ui/components/kit'

type Props = {
  primaryLabel: string
  onPrimary?: () => void
  onPrimaryPress?: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  onSecondaryPress?: () => void
  disabled?: boolean
  testID?: string
  style?: StyleProp<ViewStyle>
}

/**
 * Bottom action bar used by screens to keep primary CTA consistent.
 * UI-only.
 */
export function PrimaryActionBarModule({
  primaryLabel,
  onPrimary,
  onPrimaryPress,
  secondaryLabel,
  onSecondary,
  onSecondaryPress,
  disabled,
  testID,
  style,
}: Props) {
  const handlePrimary = onPrimaryPress ?? onPrimary ?? (() => {})
  const handleSecondary = onSecondaryPress ?? onSecondary
  return (
    <Box
      testID={testID}
      style={[
        {
          flexDirection: 'row',
          gap: 10,
          justifyContent: 'space-between',
        },
        style,
      ]}
    >
      {secondaryLabel && handleSecondary ? (
        <Box style={{ flex: 1 }}>
          <Button
            variant="secondary"
            label={secondaryLabel}
            onPress={handleSecondary}
            disabled={disabled}
            testID={testID ? `${testID}.secondary` : undefined}
          />
        </Box>
      ) : null}
      <Box style={{ flex: 1 }}>
        <Button
          label={primaryLabel}
          onPress={handlePrimary}
          disabled={disabled}
          testID={testID ? `${testID}.primary` : undefined}
        />
      </Box>
    </Box>
  )
}
