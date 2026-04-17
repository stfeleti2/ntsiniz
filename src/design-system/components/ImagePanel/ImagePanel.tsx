import React from 'react'
import { Image, ImageSourcePropType, StyleProp, View, ViewStyle } from 'react-native'
import { useTheme, useThemeControls } from '@/theme/provider'
import { resolveImagePanelStyle, type ImagePanelState, type ImagePanelVariant } from './imagePanel.variants'

export type ImagePanelProps = {
  source: ImageSourcePropType
  alt?: string
  variant?: ImagePanelVariant
  state?: ImagePanelState
  height?: number
  style?: StyleProp<ViewStyle>
  testID?: string
}

export function ImagePanel({
  source,
  alt,
  variant = 'neo-image',
  state = 'default',
  height = 180,
  style,
  testID,
}: ImagePanelProps) {
  const theme = useTheme()
  const controls = useThemeControls()
  const resolved = resolveImagePanelStyle({ theme, variant, state, mode: controls.effectiveMode })

  return (
    <View testID={testID} style={[resolved.container, { height }, style]}>
      <Image source={source} accessibilityLabel={alt} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
      <View pointerEvents="none" style={[{ position: 'absolute', inset: 0 }, resolved.overlay]} />
    </View>
  )
}
