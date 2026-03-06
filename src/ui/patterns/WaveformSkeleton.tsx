import React, { useMemo } from 'react'
import type { ViewStyle, StyleProp } from 'react-native'
import { Box } from '../primitives'
import { useTheme } from '../theme'

/**
 * Lightweight waveform loading placeholder.
 * Not a stub: indicates decoding/loading while keeping layout stable.
 */
export function WaveformSkeleton({
  bars = 72,
  height = 72,
  testID,
  style,
}: {
  bars?: number
  height?: number
  testID?: string
  style?: StyleProp<ViewStyle>
}) {
  const { colors, radius } = useTheme()

  const peaks = useMemo(() => {
    const out: number[] = []
    for (let i = 0; i < bars; i++) {
      // deterministic pseudo-random-ish curve
      const v = Math.abs(Math.sin((i + 1) * 0.73) * Math.cos((i + 3) * 0.41))
      out.push(Math.round(10 + v * 90))
    }
    return out
  }, [bars])

  return (
    <Box
      testID={testID}
      style={[
        {
          height,
          borderRadius: radius[3],
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          overflow: 'hidden',
          paddingHorizontal: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        style,
      ]}
    >
      {peaks.map((p, i) => {
        const h = Math.max(2, Math.round((p / 100) * (height - 18)))
        return (
          <Box
            key={i}
            style={{
              width: 2,
              height: h,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.12)',
            }}
          />
        )
      })}
    </Box>
  )
}
