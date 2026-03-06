import React, { useEffect } from "react"
import { StyleSheet } from 'react-native'
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated"
import { useTheme } from "@/theme/useTheme"
import { useQuality } from "@/ui/quality/useQuality"

/** Tiny “sparkle” burst for score improvements. */
export function SparkleBurst({
  triggerKey,
  enabled,
}: {
  triggerKey: string | number
  enabled: boolean
}) {
  const t = useTheme()
  const q = useQuality()
  if (!enabled) return null

  const sparkles = q.mode === 'LITE' ? SPARKLES.slice(0, 3) : q.mode === 'BALANCED' ? SPARKLES : SPARKLES_HIGH

  return (
    <Animated.View pointerEvents="none" style={styles.wrap}>
      {sparkles.map((s, i) => (
        <Sparkle
          key={i}
          triggerKey={triggerKey}
          delay={i * 35}
          x={s.x}
          y={s.y}
          color={t.colors.accent}
          duration={Math.round(650 * q.animationScale)}
        />
      ))}
    </Animated.View>
  )
}

const SPARKLES = [
  { x: -18, y: -10 },
  { x: 18, y: -12 },
  { x: -22, y: 10 },
  { x: 22, y: 12 },
  { x: 0, y: -22 },
]

const SPARKLES_HIGH = [
  ...SPARKLES,
  { x: -8, y: -26 },
  { x: 10, y: -24 },
  { x: -28, y: -2 },
  { x: 28, y: 2 },
]

function Sparkle({
  triggerKey,
  delay,
  x,
  y,
  color,
  duration,
}: {
  triggerKey: string | number
  delay: number
  x: number
  y: number
  color: string
  duration: number
}) {
  const local = useSharedValue(0)

  useEffect(() => {
    local.value = 0
    local.value = withDelay(delay, withTiming(1, { duration }))
  }, [delay, local, triggerKey])

  const st = useAnimatedStyle(() => {
    const tt = local.value
    const opacity = interpolate(tt, [0, 0.15, 0.8, 1], [0, 1, 1, 0])
    const s = interpolate(tt, [0, 0.25, 1], [0.6, 1.05, 0.9])
    const dx = x * interpolate(tt, [0, 1], [0.2, 1])
    const dy = y * interpolate(tt, [0, 1], [0.2, 1])
    return {
      opacity,
      transform: [{ translateX: dx }, { translateY: dy }, { scale: s }],
    }
  })

  return <Animated.Text style={[styles.sparkle, { color }, st]}>✦</Animated.Text>
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  sparkle: {
    position: "absolute",
    fontSize: 14,
  },
})
