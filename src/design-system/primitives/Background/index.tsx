import React from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { useTheme } from '@/theme/provider'
import type { DesignSystemTheme } from '@/design-system/tokens/colors'
import {
  resolveBackgroundStyle,
  type BackgroundVariant,
} from '@/design-system/tokens/backgrounds'

export type BackgroundProps = {
  variant?: BackgroundVariant
  theme?: DesignSystemTheme
  style?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
  children?: React.ReactNode
  testID?: string
}

export function Background({
  variant = 'solid',
  theme,
  style,
  contentStyle,
  children,
  testID,
}: BackgroundProps) {
  const appTheme = useTheme()
  const resolved = resolveBackgroundStyle(appTheme, variant, theme)

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          backgroundColor: resolved.token.backgroundColor,
          borderColor: resolved.token.borderColor,
          ...resolved.shadow,
        },
        style,
      ]}
    >
      {variant !== 'solid' ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: resolved.texture.overlayColor,
              opacity: resolved.texture.opacity,
              borderColor: resolved.texture.borderColor,
              borderWidth: 1,
            },
          ]}
        />
      ) : null}
      {variant === 'layered' ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              top: 8,
              left: 8,
              right: 8,
              bottom: 8,
              borderRadius: 16,
              backgroundColor: resolved.token.layerColor,
              borderColor: resolved.token.overlayColor,
              borderWidth: 1,
            },
          ]}
        />
      ) : null}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
})
