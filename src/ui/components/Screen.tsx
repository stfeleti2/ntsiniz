import React, { useEffect } from "react"
import { ScrollView, StyleSheet, ViewStyle, type StyleProp } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from "expo-linear-gradient"
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated"
import { useTheme } from "@/ui/theme"
import { Box, Pressable, Text } from "@/ui/primitives"
import { t as i18nT } from '@/core/i18n'

type Background = "plain" | "gradient" | "hero"

type Props = {
  children: React.ReactNode
  scroll?: boolean
  style?: StyleProp<ViewStyle>
  background?: Background
  title?: string
  subtitle?: string
  onBack?: () => void
}

export function Screen({ children, scroll = false, style, background = "plain", title, subtitle, onBack }: Props) {
  const t = useTheme()

  const Shell = ({ children: inner }: { children: React.ReactNode }) => {
    if (background === "plain") {
      return <SafeAreaView style={[styles.safe, { backgroundColor: t.colors.bg }]}>{inner}</SafeAreaView>
    }

    const colors =
      background === "hero"
        ? [t.colors.bg, "#2A1255", t.colors.bg]
        : [t.colors.bg, "#10162D", t.colors.bg]

    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.colors.bg }]}>
        <LinearGradient colors={colors as any} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
        <Backdrop variant={background} />
        {inner}
      </SafeAreaView>
    )
  }

  const header = title ? (
    <Box style={{ gap: 6 }}>
      <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text size="xl" weight="bold">{title}</Text>
        {onBack ? (
          <Pressable onPress={onBack} accessibilityRole="button" style={{ paddingVertical: 4, paddingHorizontal: 8 }}>
            <Text size="sm" tone="muted">{i18nT('common.back', 'Back')}</Text>
          </Pressable>
        ) : null}
      </Box>
      {subtitle ? <Text size="sm" tone="muted">{subtitle}</Text> : null}
    </Box>
  ) : null

  if (scroll) {
    return (
      <Shell>
        <ScrollView contentContainerStyle={[styles.container, style]} showsVerticalScrollIndicator={false}>
          {header}
          {children}
        </ScrollView>
      </Shell>
    )
  }

  return (
    <Shell>
      <Animated.View style={[styles.container, style]}>
        {header}
        {children}
      </Animated.View>
    </Shell>
  )
}

function Backdrop({ variant }: { variant: Background }) {
  const p1 = useSharedValue(0)
  const p2 = useSharedValue(0)
  const p3 = useSharedValue(0)

  useEffect(() => {
    const ease = Easing.inOut(Easing.quad)
    p1.value = withRepeat(withTiming(1, { duration: 5400, easing: ease }), -1, true)
    p2.value = withRepeat(withTiming(1, { duration: 6800, easing: ease }), -1, true)
    p3.value = withRepeat(withTiming(1, { duration: 7600, easing: ease }), -1, true)
  }, [p1, p2, p3])

  const a1 = useAnimatedStyle(() => ({
    transform: [{ translateX: (p1.value - 0.5) * 22 }, { translateY: (p1.value - 0.5) * 14 }, { rotate: "15deg" }],
  }))
  const a2 = useAnimatedStyle(() => ({
    transform: [{ translateX: (p2.value - 0.5) * -18 }, { translateY: (p2.value - 0.5) * 18 }, { rotate: "-10deg" }],
  }))
  const a3 = useAnimatedStyle(() => ({
    transform: [{ translateX: (p3.value - 0.5) * 16 }, { translateY: (p3.value - 0.5) * -16 }, { rotate: "20deg" }],
  }))

  const accent = "rgba(124, 92, 255, 0.28)"
  const pink = "rgba(255, 61, 206, 0.18)"
  const cyan = "rgba(0, 229, 255, 0.14)"

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.blob,
          {
            width: 340,
            height: 340,
            top: -140,
            left: -120,
            backgroundColor: accent,
            opacity: variant === "hero" ? 0.9 : 0.65,
          },
          a1,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.blob,
          {
            width: 260,
            height: 260,
            bottom: -140,
            right: -120,
            backgroundColor: pink,
            opacity: 0.6,
          },
          a2,
        ]}
      />
      {variant === "hero" ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.blob,
            {
              width: 220,
              height: 220,
              top: 140,
              right: -90,
              backgroundColor: cyan,
              opacity: 0.55,
            },
            a3,
          ]}
        />
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flexGrow: 1, padding: 16, gap: 14 },
  blob: {
    position: "absolute",
    borderRadius: 999,
  },
})
