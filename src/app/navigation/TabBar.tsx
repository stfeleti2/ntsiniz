import React, { useEffect } from "react"
import { StyleSheet } from 'react-native'
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import Animated, { Extrapolate, interpolate, type SharedValue, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme } from "@/theme/useTheme"
import { Box, Pressable } from '@/ui'

const AnimatedGradient: any = Animated.createAnimatedComponent(LinearGradient as any)

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const t = useTheme()
  const insets = useSafeAreaInsets()
  const active = state.index
  const x = useSharedValue(active)

  useEffect(() => {
    x.value = withSpring(active, { damping: 16, stiffness: 180 })
  }, [active, x])

  const indicator = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: x.value * 82 }],
    }
  })

  return (
    <Box style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10), backgroundColor: "rgba(10, 12, 18, 0.92)", borderTopColor: t.colors.line }]}>
      <Box style={[styles.inner, { borderColor: t.colors.line }]}> 
        <AnimatedGradient
          colors={t.gradients.primary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.indicator, { borderColor: "rgba(255,255,255,0.18)" }, indicator]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const label = options.tabBarLabel ?? options.title ?? route.name

          const isFocused = state.index === index

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never)
            }
          }

          const icon = iconFor(route.name)

          return (
            <TabItem
              key={route.key}
              label={String(label)}
              icon={icon}
              index={index}
              x={x}
              onPress={onPress}
              testID={`tab-${route.name}`}
            />
          )
        })}
      </Box>
    </Box>
  )
}

function TabItem({
  label,
  icon,
  index,
  x,
  onPress,
  testID,
}: {
  label: string
  icon: string
  index: number
  x: SharedValue<number>
  onPress: () => void
  testID: string
}) {
  const t = useTheme()

  const iconAnim = useAnimatedStyle(() => {
    const d = Math.abs(x.value - index)
    const s = interpolate(d, [0, 1], [1.14, 1], Extrapolate.CLAMP)
    const ty = interpolate(d, [0, 1], [-2, 0], Extrapolate.CLAMP)
    return { transform: [{ scale: s }, { translateY: ty }] }
  })

  const labelAnim = useAnimatedStyle(() => {
    const d = Math.abs(x.value - index)
    const o = interpolate(d, [0, 1], [1, 0.7], Extrapolate.CLAMP)
    return { opacity: o }
  })

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.item}
    >
      <Animated.Text style={[{ textAlign: "center", fontWeight: "900", fontSize: 18, color: t.colors.text }, iconAnim]}>
        {icon}
      </Animated.Text>
      <Animated.Text style={[{ textAlign: "center", fontSize: 11, fontWeight: "800", color: t.colors.muted }, labelAnim]}>
        {label}
      </Animated.Text>
    </Pressable>
  )
}

function iconFor(name: string) {
  switch (name) {
    case "Home":
      return "🏠"
    case "Session":
      return "🎤"
    case "Journey":
      return "🗺️"
    case "Settings":
      return "⚙️"
    case "Community":
      return "👥"
    default:
      return "•"
  }
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
  },
  inner: {
    alignSelf: "center",
    flexDirection: "row",
    padding: 6,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
  },
  indicator: {
    position: "absolute",
    left: 6,
    top: 6,
    width: 82,
    height: 48,
    borderRadius: 18,
    borderWidth: 1,
  },
  item: {
    width: 82,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
})
