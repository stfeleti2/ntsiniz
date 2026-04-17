/**
 * Card — a raised neumorphic card with standard padding.
 *
 * Use for content groupings, list items, and standalone sections.
 * For non-padded surfaces use SurfaceView.
 */

import React from 'react'
import type { ViewStyle, StyleProp } from 'react-native'
import { SurfacePanel } from './SurfacePanel'
import type { NeumorphElevation, SurfaceQuality } from '@/theme/neumorphism/types'

export type CardProps = {
  elevation?: NeumorphElevation
  quality?: SurfaceQuality
  padding?: number
  paddingHorizontal?: number
  paddingVertical?: number
  radius?: number
  /** Optional header rendered above the content area (outside padding). */
  header?: React.ReactNode
  /** Optional footer rendered below the content area (outside padding). */
  footer?: React.ReactNode
  style?: StyleProp<ViewStyle>
  containerStyle?: StyleProp<ViewStyle>
  children?: React.ReactNode
  testID?: string
}

export function Card({
  elevation = 'raised',
  quality,
  padding = 16,
  paddingHorizontal,
  paddingVertical,
  radius,
  header,
  footer,
  style,
  containerStyle,
  children,
  testID,
}: CardProps) {
  return (
    <SurfacePanel
      elevation={elevation}
      quality={quality}
      padding={header || footer ? 0 : padding}
      paddingHorizontal={header || footer ? undefined : paddingHorizontal}
      paddingVertical={header || footer ? undefined : paddingVertical}
      radius={radius}
      style={style}
      containerStyle={containerStyle}
      testID={testID}
    >
      {header}
      {header || footer ? (
          <SurfacePanel
          elevation="flat"
          padding={padding}
          paddingHorizontal={paddingHorizontal}
          paddingVertical={paddingVertical}
          radius={0}
          containerStyle={{ flex: 1 }}
        >
          {children}
        </SurfacePanel>
      ) : (
        children
      )}
      {footer}
    </SurfacePanel>
  )
}
