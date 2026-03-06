import React from "react"
import { StyleSheet } from 'react-native'
import Animated, { FadeInDown } from "react-native-reanimated"
import type { JourneyNodeState } from "@/core/progress/journeyPath"
import { useTheme } from "@/theme/useTheme"
import { Text } from "@/ui/components/Typography"
import { Button } from "@/ui/components/Button"
import { Card } from "@/ui/components/Card"
import { Box } from '@/ui'

type Props = {
  nodes: JourneyNodeState[]
  onStartMission?: (n: JourneyNodeState) => void
}

export function JourneyMap({ nodes, onStartMission }: Props) {
  const t = useTheme()

  return (
    <Box style={{ gap: 12 }}>
      {nodes.map((n, idx) => {
        const isNext = n.status === "next"
        const complete = n.status === "complete"
        const accent = isNext ? t.colors.accent2 : complete ? t.colors.good : t.colors.line
        const side: "left" | "right" = idx % 2 === 0 ? "left" : "right"
        const emoji = emojiFor(n)

        return (
          <Animated.View key={n.id} entering={FadeInDown.duration(250).delay(idx * 40)}>
            <Card
              tone={isNext ? "glow" : "default"}
              style={[
                styles.node,
                {
                  borderColor: accent,
                  backgroundColor: isNext ? "rgba(20, 24, 36, 0.9)" : t.colors.card,
                },
                side === "right" ? { alignSelf: "flex-end" } : null,
              ]}
            >
              <Box style={styles.row}>
                <Box
                  style={[
                    styles.dot,
                    {
                      backgroundColor: complete ? t.colors.good : isNext ? t.colors.accent : "rgba(255,255,255,0.12)",
                    },
                  ]}
                >
                  <Text preset="body" style={{ fontSize: 14, fontWeight: "900" }}>
                    {emoji}
                  </Text>
                </Box>
                <Box style={{ flex: 1, gap: 4 }}>
                  <Box style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text preset="h2" style={{ fontSize: 18 }}>
                      {n.title}
                    </Text>
                    <Text preset="muted" style={{ fontWeight: "800" }}>
                      {complete ? "DONE" : isNext ? "NEXT" : n.status === "unlocked" ? "OPEN" : "LOCK"}
                    </Text>
                  </Box>
                  <Text preset="muted">{n.subtitle}</Text>

                  {isNext ? (
                    <Box style={{ marginTop: 8 }}>
                      <Button text="Start this mission" onPress={() => onStartMission?.(n)} />
                    </Box>
                  ) : null}
                </Box>
              </Box>

              {idx < nodes.length - 1 ? (
                <Box style={[styles.connector, { backgroundColor: complete ? "rgba(46, 229, 157, 0.35)" : "rgba(255,255,255,0.08)" }]} />
              ) : null}
            </Card>
          </Animated.View>
        )
      })}
    </Box>
  )
}

function emojiFor(n: JourneyNodeState) {
  if (n.id === "baseline") return "👀"
  if (n.id === "steady_hold") return "🧘"
  if (n.id === "clean_start") return "⚡"
  if (n.id === "smooth_slide") return "🧊"
  if (n.id === "intervals") return "🎶"
  if (n.id === "melody_echo") return "🎼"
  if (n.id === "level_up") return "🏁"
  return "✨"
}

const styles = StyleSheet.create({
  node: {
    overflow: "hidden",
    width: "94%",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 99,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  connector: {
    position: "absolute",
    left: 30,
    bottom: -26,
    width: 2,
    height: 26,
    borderRadius: 99,
  },
})
