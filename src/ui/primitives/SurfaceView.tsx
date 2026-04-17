/**
 * SurfaceView — a layout-only neumorphic container with no interactivity.
 *
 * Use this as the top-level surface for screens, panels, and sections.
 * For cards with standard padding use Card.
 * For pressable surfaces use SurfacePressable or Button.
 */

import React from 'react'
import type { ViewStyle, StyleProp } from 'react-native'
import { SurfacePanel, type SurfacePanelProps } from './SurfacePanel'

export type SurfaceViewProps = SurfacePanelProps & {
  style?: StyleProp<ViewStyle>
}

export function SurfaceView({
  elevation = 'raised',
  children,
  style,
  ...rest
}: SurfaceViewProps) {
  return (
    <SurfacePanel elevation={elevation} style={style} {...rest}>
      {children}
    </SurfacePanel>
  )
}
