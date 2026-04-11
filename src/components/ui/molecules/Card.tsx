import React from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'
import { useTheme } from '@/theme/provider'
import { getNeumorphicSurfaceStyle, type SurfaceQuality } from '@/theme/neumorphism'
import type { SurfaceVariant } from '@/theme/tokens'

type CardTone = 'default' | 'elevated' | 'glow' | 'warning'

function toneToVariant(tone: CardTone): SurfaceVariant {
  if (tone === 'elevated') return 'raised'
  if (tone === 'glow') return 'glass'
  if (tone === 'warning') return 'inset'
  return 'flat'
}

export function Card({
  children,
  tone = 'default',
  style,
  testID,
  quality = 'full',
}: {
  children?: React.ReactNode
  tone?: CardTone
  style?: StyleProp<ViewStyle>
  testID?: string
  quality?: SurfaceQuality
}) {
  const theme = useTheme()
  const variant = toneToVariant(tone)
  const surface = getNeumorphicSurfaceStyle(theme, {
    variant,
    quality,
    radius: theme.radius[3],
    padding: 14,
  })

  const warningStyle =
    tone === 'warning'
      ? {
          borderColor: theme.colors.warning,
        }
      : null

  return (
    <View
      testID={testID}
      style={[
        surface,
        {
          gap: theme.spacing[2],
        },
        warningStyle,
        style,
      ]}
    >
      {children}
    </View>
  )
}
