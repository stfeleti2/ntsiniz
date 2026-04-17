import React from 'react'
import { Platform, Text as RNText, TextProps as RNTextProps, TextStyle, StyleProp } from 'react-native'
import { useTheme } from '../theme'
import {
  resolveTextVariantShadow,
  carvedCssShadowTokens,
  type CarvedDepth,
} from '@/design-system/tokens/shadows'
import {
  designSystemColors,
  resolveTextVariantColors,
  type DesignSystemTheme,
} from '@/design-system/tokens/colors'
import {
  resolveTextVariantTypography,
  type TextVariant,
  type TextVariantDepth,
} from '@/design-system/tokens/typography'

export type TextProps = RNTextProps & {
  tone?: 'default' | 'muted' | 'danger' | 'success'
  variant?: TextVariant
  theme?: DesignSystemTheme
  carvedDepth?: CarvedDepth
  depth?: TextVariantDepth
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  weight?: 'regular' | 'medium' | 'semibold' | 'bold'
  style?: StyleProp<TextStyle>
  testID?: string
}

export function Text({
  tone = 'default',
  variant = 'carved',
  theme,
  carvedDepth = 'normal',
  depth,
  size = 'md',
  weight = 'regular',
  style,
  testID,
  ...rest
}: TextProps) {
  const { colors, typography } = useTheme()
  const mode: DesignSystemTheme = theme ?? (colors.bg === designSystemColors.light.canvas ? 'light' : 'dark')
  const resolvedDepth = depth ?? carvedDepth
  const toneColor =
    tone === 'muted'
      ? colors.muted
      : tone === 'danger'
        ? colors.danger
        : tone === 'success'
          ? colors.success
          : colors.text

  const variantToken = resolveTextVariantTypography(variant, resolvedDepth)
  const variantColorToken = resolveTextVariantColors(mode, variant)
  const effectShadow =
    variant === 'default'
      ? null
      : resolveTextVariantShadow(
          colors,
          variant === 'neo-soft' ? 'neo-soft' : variant === 'embossed' ? 'embossed' : 'carved',
          resolvedDepth,
        )

  function parseCssTextShadow(token: string) {
    const match = token.match(/(-?\d*\.?\d+)px\s+(-?\d*\.?\d+)px\s+(\d*\.?\d+)px\s+(.+)/)
    if (!match) {
      return null
    }
    return {
      textShadowOffset: { width: Number(match[1]), height: Number(match[2]) },
      textShadowRadius: Number(match[3]),
      textShadowColor: match[4],
    }
  }

  const carvedCssShadow =
    variant === 'carved'
      ? parseCssTextShadow(
          mode === 'light' ? carvedCssShadowTokens.carvedLight : carvedCssShadowTokens.carvedDark,
        )
      : null

  const resolvedTextColor = tone === 'default'
    ? variant === 'default'
      ? toneColor
      : variantColorToken.color
    : toneColor

  const webVariantStyle =
    variant !== 'default' && effectShadow
      ? {
          color:
            variant === 'carved'
              ? variantColorToken.webTextFillColor ?? variantColorToken.color
              : variantColorToken.color,
          textShadowColor: carvedCssShadow?.textShadowColor ?? effectShadow.textShadowColor,
          textShadowOffset: carvedCssShadow?.textShadowOffset ?? effectShadow.textShadowOffset,
          textShadowRadius: carvedCssShadow?.textShadowRadius ?? effectShadow.textShadowRadius,
          ...(variant === 'carved'
            ? {
                backgroundColor: variantColorToken.backgroundColor,
                backgroundClip: 'text' as const,
                WebkitBackgroundClip: 'text' as const,
                WebkitTextFillColor: variantColorToken.webTextFillColor,
              }
            : variantColorToken.tintColor
              ? { backgroundColor: variantColorToken.tintColor }
              : null),
          cursor: variantToken.cursor as any,
        } as TextStyle & Record<string, unknown>
      : null

  return (
    <RNText
      accessibilityRole={rest.accessibilityRole ?? 'text'}
      testID={testID}
      {...rest}
      style={[
        {
          color: resolvedTextColor,
          fontSize: typography.size[size],
          lineHeight: typography.lineHeight[size],
          fontWeight: typography.weight[weight] as any,
          letterSpacing: variantToken.letterSpacing,
          userSelect: !variantToken.selectable ? ('none' as any) : undefined,
          ...(variant !== 'default' && effectShadow
            ? {
                ...effectShadow,
                ...(Platform.OS === 'web'
                  ? webVariantStyle
                  : {
                      color: variantColorToken.color,
                    }),
              }
            : null),
        },
        style,
      ]}
    />
  )
}
