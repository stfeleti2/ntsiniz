import React, { useEffect, useMemo } from "react"
import { ScrollView, StyleSheet, ViewStyle, type StyleProp, useWindowDimensions } from 'react-native'
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
  const { width } = useWindowDimensions()
  const layout = useMemo(() => {
    if (width >= t.breakpoints.tabletLg) return { paddingHorizontal: 34, paddingVertical: 22, gap: 18 }
    if (width >= t.breakpoints.tablet) return { paddingHorizontal: 26, paddingVertical: 20, gap: 16 }
    return { paddingHorizontal: 16, paddingVertical: 16, gap: 14 }
  }, [width, t.breakpoints.tablet, t.breakpoints.tabletLg])

  const Shell = ({ children: inner }: { children: React.ReactNode }) => {
    if (background === "plain") {
      return <SafeAreaView style={[styles.safe, { backgroundColor: t.colors.bg }]}>{inner}</SafeAreaView>
    }

    const colors =
      background === "hero"
        ? [t.colors.bg, '#13112A', '#201A41', '#131125', t.colors.bg]
        : [t.colors.bg, '#10182F', '#121A32', t.colors.bg]

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
        <ScrollView contentContainerStyle={[styles.container, layout, style]} showsVerticalScrollIndicator={false}>
          {header}
          {children}
        </ScrollView>
      </Shell>
    )
  }

  return (
    <Shell>
      <Animated.View style={[styles.container, layout, style]}>
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

  const accent = "rgba(122, 107, 255, 0.30)"
  const pink = "rgba(236, 166, 255, 0.16)"
  const cyan = "rgba(137, 233, 255, 0.18)"

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
            opacity: variant === "hero" ? 0.92 : 0.7,
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
              top: 124,
              right: -84,
              backgroundColor: cyan,
              opacity: 0.62,
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
  container: { flexGrow: 1 },
  blob: {
    position: "absolute",
    borderRadius: 999,
    shadowColor: '#8E89FF',
    shadowOpacity: 0.34,
    shadowRadius: 42,
    shadowOffset: { width: 0, height: 18 },
  },
})
