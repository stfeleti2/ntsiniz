import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import { Card as PrimitiveCard } from '../../primitives'
import type { NeumorphElevation, SurfaceQuality } from '@/theme/neumorphism/types'

export type CardTone = 'default' | 'elevated' | 'glow' | 'warning'

function toneToElevation(tone: CardTone): NeumorphElevation {
  if (tone === 'elevated') return 'raised'
  if (tone === 'glow') return 'glass'
  if (tone === 'warning') return 'inset'
  return 'flat'
}

export function Card({
  children,
  style,
  testID,
  elevation: elevationProp,
  tone,
  quality,
  padding = 16,
}: {
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  testID?: string
  elevation?: NeumorphElevation
  tone?: CardTone
  quality?: SurfaceQuality
  padding?: number
}) {
  const elevation = elevationProp || (tone ? toneToElevation(tone) : 'raised')

  return (
    <PrimitiveCard
      testID={testID}
      elevation={elevation}
      quality={quality}
      padding={padding}
      style={style}
    >
      {children}
    </PrimitiveCard>
  )
}
