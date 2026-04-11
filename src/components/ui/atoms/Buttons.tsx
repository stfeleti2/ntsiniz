import React from 'react'
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native'
import { useTheme } from '@/theme/provider'
import { getNeumorphicSurfaceStyle, type SurfaceQuality } from '@/theme/neumorphism'
import { AppText } from './TextBase'
import { Icon, type IconName } from './Icon'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type BaseButtonProps = {
  label: string
  onPress?: () => void
  disabled?: boolean
  testID?: string
  style?: StyleProp<ViewStyle>
  quality?: SurfaceQuality
}

type IconButtonProps = {
  icon: IconName
  onPress?: () => void
  disabled?: boolean
  testID?: string
  style?: StyleProp<ViewStyle>
  quality?: SurfaceQuality
}

function paletteFor(variant: ButtonVariant, theme: ReturnType<typeof useTheme>) {
  if (variant === 'secondary') {
    return {
      backgroundColor: theme.colors.surfaceRaised,
      borderColor: theme.colors.borderStrong,
      textColor: theme.colors.text,
    }
  }

  if (variant === 'ghost') {
    return {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
      textColor: theme.colors.textMuted,
    }
  }

  return {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    textColor: theme.colors.highContrastText,
  }
}

function AppButton({
  label,
  variant,
  onPress,
  disabled,
  testID,
  style,
  quality = 'full',
}: BaseButtonProps & { variant: ButtonVariant }) {
  const theme = useTheme()
  const palette = paletteFor(variant, theme)
  const neumorphic = getNeumorphicSurfaceStyle(theme, {
    variant: variant === 'ghost' ? 'flat' : 'raised',
    quality,
    padding: 0,
    borderWidth: 1,
    radius: theme.radius[3],
  })

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.buttonBase,
        neumorphic,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      <AppText
        size="sm"
        weight="semibold"
        style={{ color: palette.textColor } as TextStyle}
      >
        {label}
      </AppText>
    </Pressable>
  )
}

export function PrimaryButton(props: BaseButtonProps) {
  return <AppButton {...props} variant="primary" />
}

export function SecondaryButton(props: BaseButtonProps) {
  return <AppButton {...props} variant="secondary" />
}

export function GhostButton(props: BaseButtonProps) {
  return <AppButton {...props} variant="ghost" />
}

export function IconButton({ icon, onPress, disabled, testID, style, quality = 'full' }: IconButtonProps) {
  const theme = useTheme()
  const neumorphic = getNeumorphicSurfaceStyle(theme, {
    variant: 'raised',
    quality,
    radius: theme.radius.pill,
    padding: 0,
  })

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.iconButton,
        neumorphic,
        {
          backgroundColor: theme.colors.surfaceRaised,
          borderColor: theme.colors.border,
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
        style,
      ]}
    >
      <View>
        <Icon name={icon} size={18} color={theme.colors.text} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  buttonBase: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
})

