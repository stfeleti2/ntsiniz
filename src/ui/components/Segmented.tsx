import React from "react"
import { StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme } from "@/theme/useTheme"
import { Text } from "./Typography"
import { Box, Pressable } from '@/ui'

type Option<T extends string> = { key: T; label: string }

type Props<T extends string> = {
  value: T
  options: Option<T>[]
  onChange: (v: T) => void
  testIDPrefix?: string
}

const AnimatedGradient: any = Animated.createAnimatedComponent(LinearGradient as any)

export function Segmented<T extends string>({ value, options, onChange, testIDPrefix }: Props<T>) {
  const t = useTheme()
  const idx = Math.max(0, options.findIndex((o) => o.key === value))

  const x = useSharedValue(idx)
  React.useEffect(() => {
    x.value = withSpring(idx, { damping: 16, stiffness: 180 })
  }, [idx, x])

  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * 120 }] }))

  return (
    <Box style={[styles.wrap, { borderColor: t.colors.line, backgroundColor: t.colors.card }]}> 
      <AnimatedGradient
        colors={t.gradients.primary as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.indicator, { borderColor: t.colors.line }, indicator]}
      />
      {options.map((o) => {
        const active = o.key === value
        return (
          <Pressable
            key={o.key}
            style={styles.item}
            accessibilityRole="button"
            accessibilityLabel={o.label}
            onPress={() => onChange(o.key)}
            testID={testIDPrefix ? `${testIDPrefix}-${o.key}` : undefined}
          >
            <Text preset={active ? "body" : "muted"} style={{ textAlign: "center", fontWeight: active ? "900" : "800" }}>
              {o.label}
            </Text>
          </Pressable>
        )
      })}
    </Box>
  )
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 18,
    flexDirection: "row",
    padding: 4,
    overflow: "hidden",
  },
  indicator: {
    position: "absolute",
    left: 4,
    top: 4,
    width: 120,
    height: 36,
    borderRadius: 14,
    borderWidth: 1,
  },
  item: {
    width: 120,
    height: 36,
    justifyContent: "center",
  },
})
