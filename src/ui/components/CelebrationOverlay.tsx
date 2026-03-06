import React, { useEffect } from "react"
import { Platform, StyleSheet, Vibration } from 'react-native'
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { Box } from '@/ui'
import { useTheme } from "@/theme/useTheme"
import { Text } from "./Typography"
import { PopIn } from "./PopIn"
import { playSfx } from "@/app/audio/sfx"

export type CelebrationKind = "pb" | "streak" | "win"

export function CelebrationOverlay({
  visible,
  kind,
  emoji,
  title,
  subtitle,
  pills,
  soundEnabled,
  onDone,
}: {
  visible: boolean
  kind: CelebrationKind
  emoji: string
  title: string
  subtitle?: string
  pills?: { emoji: string; text: string }[]
  soundEnabled?: boolean
  onDone?: () => void
}) {
  const t = useTheme()
  const show = useSharedValue(0)
  const burst = useSharedValue(0)

  useEffect(() => {
    if (!visible) return

    // Haptics (no extra deps). iOS will still provide a basic vibration.
    if (kind === "pb") {
      Vibration.vibrate(Platform.OS === "android" ? [0, 25, 40, 25, 50, 25] : 40)
    } else if (kind === "streak") {
      Vibration.vibrate(Platform.OS === "android" ? [0, 20, 30, 20] : 30)
    } else {
      Vibration.vibrate(Platform.OS === "android" ? 25 : 20)
    }

    // Optional sound cue (subtle)
    if (soundEnabled) {
      void playSfx(kind === "pb" ? "pb" : kind === "streak" ? "streak" : "win").catch(() => {})
    }

    // Animate in
    show.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) })
    burst.value = 0
    burst.value = withSpring(1, { damping: 14, stiffness: 180 })

    // Auto dismiss (driven from JS timer for reliability)
    const ms = kind === "pb" ? 1800 : 1300
    show.value = withDelay(ms, withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) }))
    const timer = setTimeout(() => onDone?.(), ms + 260)
    return () => clearTimeout(timer)
  }, [visible, kind, onDone, show, burst])

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: show.value,
  }))

  const cardStyle = useAnimatedStyle(() => {
    const s = interpolate(show.value, [0, 1], [0.88, 1])
    return {
      transform: [{ scale: s }],
      opacity: show.value,
    }
  })

  if (!visible) return null

  const pillList = (pills ?? []).slice(0, 3)

  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, overlayStyle]}>
      <Box style={[styles.backdrop, { backgroundColor: "rgba(0,0,0,0.55)" }]} />

      {/* Confetti burst */}
      <Box style={styles.confettiWrap} pointerEvents="none">
        {ANGLES.map((a) => (
          <ConfettiDot key={a} angleDeg={a} burst={burst} color={t.colors.accent} />
        ))}
      </Box>

      <Animated.View style={[styles.card, { backgroundColor: t.colors.card, borderColor: t.colors.line }, cardStyle]}>
        <Text style={styles.emoji} preset="h1">
          {emoji}
        </Text>
        <Text preset="h1" style={{ textAlign: "center" }}>
          {title}
        </Text>
        {subtitle ? (
          <Text preset="muted" style={{ textAlign: "center", marginTop: 6 }}>
            {subtitle}
          </Text>
        ) : null}

        {pillList.length ? (
          <Box style={styles.pills}>
            {pillList.map((p, idx) => (
              <PopIn key={`${p.text}-${idx}`} enabled delayMs={idx * 110}>
                <Box style={[styles.pill, { borderColor: t.colors.line, backgroundColor: "rgba(124,92,255,0.12)" }]}>
                  <Text preset="muted">
                    {p.emoji} {p.text}
                  </Text>
                </Box>
              </PopIn>
            ))}
          </Box>
        ) : null}
      </Animated.View>
    </Animated.View>
  )
}

const ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

function ConfettiDot({
  angleDeg,
  burst,
  color,
}: {
  angleDeg: number
  burst: SharedValue<number>
  color: string
}) {
  const r = 92
  const rad = (angleDeg * Math.PI) / 180
  const dx = Math.cos(rad)
  const dy = Math.sin(rad)
  const dotStyle = useAnimatedStyle(() => {
    const tt = burst.value
    const dist = r * tt
    return {
      opacity: interpolate(tt, [0, 0.15, 1], [0, 1, 0]),
      transform: [
        { translateX: dx * dist },
        { translateY: dy * dist },
        { scale: interpolate(tt, [0, 1], [0.6, 1.2]) },
        { rotate: `${angleDeg}deg` },
      ],
    }
  })

  return <Animated.View style={[styles.dot, { backgroundColor: color }, dotStyle]} />
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: "86%",
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  emoji: {
    fontSize: 52,
    marginBottom: 4,
  },
  pills: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  confettiWrap: {
    position: "absolute",
    width: 1,
    height: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
})
