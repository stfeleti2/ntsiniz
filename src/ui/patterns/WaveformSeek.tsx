import React, { useCallback, useMemo, useRef, useState } from 'react'
import type { GestureResponderEvent, LayoutChangeEvent, ViewStyle, StyleProp } from 'react-native'
import { Box, Pressable } from '../primitives'
import { useTheme } from '../theme'
import { progressFromX, xFromProgress } from './waveformMath'

type Props = {
  /** Quantized peaks: 0..100 */
  peaks: number[]
  /** 0..1 */
  progress?: number
  /** Seek callback receives 0..1 */
  onSeek?: (p: number) => void
  height?: number
  testID?: string
  style?: StyleProp<ViewStyle>
  disabled?: boolean
}

/**
 * Real waveform renderer with tap-to-seek.
 * Uses only RN Views (no SVG dependency) and stays fast by keeping the bar count small.
 */
export function WaveformSeek({ peaks, progress = 0, onSeek, height = 72, testID, style, disabled }: Props) {
  const { colors, radius } = useTheme()
  const [w, setW] = useState(1)
  const widthRef = useRef(1)
  const paddingX = 10

  const bars = useMemo(() => {
    const safe = Array.isArray(peaks) ? peaks : []
    return safe.length ? safe : new Array(72).fill(0)
  }, [peaks])

  const activeBars = useMemo(() => {
    const idx = Math.floor(Math.max(0, Math.min(1, progress)) * bars.length)
    return idx
  }, [bars.length, progress])

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const ww = e.nativeEvent.layout.width
    widthRef.current = ww
    setW(ww)
  }, [])

  const seekFromX = useCallback(
    (x: number) => {
      const ww = widthRef.current || w || 1
      const p = progressFromX(x, ww, paddingX)
      onSeek?.(p)
    },
    [onSeek, paddingX, w],
  )

  const canInteract = !disabled && typeof onSeek === 'function'

  const barWidth = useMemo(() => {
    // keep a visible gap at small widths
    const total = bars.length
    const gap = 2
    const bw = Math.max(1, Math.floor((w - gap * (total - 1)) / total))
    return { bw, gap }
  }, [bars.length, w])

  return (
    <Pressable
      testID={testID}
      accessibilityRole="adjustable"
      accessibilityLabel={testID ? `${testID}.waveform` : 'waveform'}
      disabled={!canInteract}
      onPress={(e) => {
        seekFromX((e as GestureResponderEvent).nativeEvent.locationX)
      }}
      // Drag-to-seek (responder) for a real scrub feel.
      onStartShouldSetResponder={() => canInteract}
      onMoveShouldSetResponder={() => canInteract}
      onResponderGrant={(e) => {
        seekFromX((e as GestureResponderEvent).nativeEvent.locationX)
      }}
      onResponderMove={(e) => {
        seekFromX((e as GestureResponderEvent).nativeEvent.locationX)
      }}
      style={[
        {
          height,
          borderRadius: radius[3],
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          overflow: 'hidden',
        },
        style,
      ]}
      onLayout={onLayout}
    >
      <Box
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: paddingX,
        }}
      >
        {bars.map((p, i) => {
          const h = Math.max(2, Math.round((Math.max(0, Math.min(100, p)) / 100) * (height - 18)))
          const active = i <= activeBars
          return (
            <Box
              key={i}
              style={{
                width: barWidth.bw,
                marginRight: i === bars.length - 1 ? 0 : barWidth.gap,
                height: h,
                borderRadius: 2,
                backgroundColor: active ? colors.primary : 'rgba(255,255,255,0.18)',
              }}
            />
          )
        })}
      </Box>
      {/* progress indicator */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 2,
          left: xFromProgress(progress, w, paddingX),
          backgroundColor: 'rgba(255,255,255,0.6)',
        }}
      />
    </Pressable>
  )
}
