import React from 'react'
import {
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
  type ViewStyle,
  type AccessibilityRole,
} from 'react-native'

export type PressableProps = RNPressableProps & {
  testID?: string
  accessibilityLabel?: string
  accessibilityHint?: string
}

/**
 * Thin wrapper over RN Pressable that:
 * - accepts testID + a11y props
 * - defaults accessibilityRole to 'button' when onPress exists
 * - wires accessibilityState.disabled when disabled
 */
export const Pressable = React.forwardRef<React.ElementRef<typeof RNPressable>, PressableProps>(function Pressable(
  { style, accessibilityRole, accessibilityState, disabled, onPress, ...rest },
  ref,
) {
  const role: AccessibilityRole | undefined = accessibilityRole ?? (onPress ? 'button' : undefined)

  const mergedA11yState = {
    ...accessibilityState,
    disabled: disabled ?? accessibilityState?.disabled,
  }

  return (
    <RNPressable
      ref={ref}
      {...rest}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole={role}
      accessibilityState={mergedA11yState}
      style={style as ViewStyle | ViewStyle[]}
    />
  )
})
