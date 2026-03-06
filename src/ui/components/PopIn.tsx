import React, { useEffect } from "react"
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withDelay, withSpring } from "react-native-reanimated"

/**
 * Small utility to make items feel “game-native”.
 * Use for chips/badges: staggered pop-in.
 */
export function PopIn({
  enabled,
  delayMs,
  children,
}: {
  enabled: boolean
  delayMs: number
  children: React.ReactNode
}) {
  const v = useSharedValue(enabled ? 0 : 1)

  useEffect(() => {
    if (!enabled) {
      v.value = 1
      return
    }
    v.value = 0
    v.value = withDelay(
      delayMs,
      withSpring(1, {
        damping: 12,
        stiffness: 180,
      }),
    )
  }, [enabled, delayMs, v])

  const st = useAnimatedStyle(() => {
    const opacity = enabled ? interpolate(v.value, [0, 0.35, 1], [0, 1, 1]) : 1
    const s = enabled ? interpolate(v.value, [0, 1], [0.92, 1]) : 1
    return {
      opacity,
      transform: [{ scale: s }],
    }
  })

  return <Animated.View style={st}>{children}</Animated.View>
}
