import React from 'react'
import {
  TextInput as RNTextInput,
  View,
  StyleSheet,
  type StyleProp,
  type TextInputProps as RNTextInputProps,
  type ViewStyle,
} from 'react-native'
import { useTheme } from '@/theme/provider'
import { getNeumorphicSurfaceStyle, type SurfaceQuality } from '@/theme/neumorphism'
import { AppText } from './TextBase'

export type TextInputProps = RNTextInputProps & {
  label?: string
  helperText?: string
  errorText?: string
  containerStyle?: StyleProp<ViewStyle>
  quality?: SurfaceQuality
}

export function TextInput({
  label,
  helperText,
  errorText,
  containerStyle,
  quality = 'full',
  style,
  ...rest
}: TextInputProps) {
  const theme = useTheme()
  const hasError = !!errorText
  const surfaceStyle = getNeumorphicSurfaceStyle(theme, {
    variant: hasError ? 'inset' : 'raised',
    state: hasError ? 'pressed' : 'default',
    quality,
    radius: theme.radius[3],
    padding: 0,
  })

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <AppText size="sm" tone="muted">{label}</AppText> : null}
      <View
        style={[
          styles.inputShell,
          surfaceStyle,
          {
            borderColor: hasError ? theme.colors.danger : theme.colors.border,
            backgroundColor: theme.colors.surfaceRaised,
          },
        ]}
      >
        <RNTextInput
          {...rest}
          placeholderTextColor={theme.colors.textSubtle}
          style={[
            styles.input,
            {
              color: theme.colors.text,
            },
            style,
          ]}
        />
      </View>
      {errorText ? <AppText size="sm" tone="danger">{errorText}</AppText> : null}
      {!errorText && helperText ? <AppText size="sm" tone="muted">{helperText}</AppText> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  inputShell: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 8,
  },
})

