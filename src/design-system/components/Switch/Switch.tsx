import React from 'react'
import { Animated, Pressable, StyleSheet, View } from 'react-native'
import { useTheme, useThemeControls } from '@/theme/provider'
import { Text } from '@/ui/primitives/Text'
import { resolveSwitchVariantStyle, type SwitchState, type SwitchVariant } from './switch.variants'

export type SwitchProps = {
  checked: boolean
  onChange?: (next: boolean) => void
  disabled?: boolean
  variant?: SwitchVariant
  state?: SwitchState
  checkedLabel?: string
  uncheckedLabel?: string
  testID?: string
}

export function Switch({
  checked,
  onChange,
  disabled,
  variant = 'neo-toggle',
  state = 'default',
  checkedLabel = 'On',
  uncheckedLabel = 'Off',
  testID,
}: SwitchProps) {
  const theme = useTheme()
  const controls = useThemeControls()
  const styles = resolveSwitchVariantStyle({
    theme,
    variant,
    checked,
    state: disabled ? 'disabled' : state,
    mode: controls.effectiveMode,
  })

  const animated = React.useRef(new Animated.Value(checked ? 1 : 0)).current

  React.useEffect(() => {
    Animated.timing(animated, {
      toValue: checked ? 1 : 0,
      duration: 170,
      useNativeDriver: false,
    }).start()
  }, [checked, animated])

  const translateX = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [0, variant === 'icon-round' ? 32 : 30],
  })

  return (
    <Pressable
      testID={testID}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      style={styles.track}
    >
      <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <View style={local.overlay}>
          <Text size="xs" weight="semibold" style={{ color: styles.iconColor }}>
            {checked ? checkedLabel : uncheckedLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

const local = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
