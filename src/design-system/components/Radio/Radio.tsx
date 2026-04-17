import React from 'react'
import { Pressable, View } from 'react-native'
import { Text } from '@/ui/primitives/Text'
import { useTheme } from '@/theme/provider'
import { resolveRadioStyle, type RadioState, type RadioVariant } from './radio.variants'

export type RadioProps = {
  label: string
  variant?: RadioVariant
  selected: boolean
  onPress?: () => void
  disabled?: boolean
  state?: RadioState
  testID?: string
}

export function Radio({
  label,
  variant = 'neo-dot',
  selected,
  onPress,
  disabled,
  state = 'default',
  testID,
}: RadioProps) {
  const theme = useTheme()
  const styles = resolveRadioStyle({
    theme,
    variant,
    selected,
    state: disabled ? 'disabled' : state,
  })

  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
    >
      <View style={styles.outer}>
        <View style={styles.inner} />
      </View>
      <Text style={{ color: disabled ? theme.colors.textSubtle : theme.colors.text }}>{label}</Text>
    </Pressable>
  )
}
