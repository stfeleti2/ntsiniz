import React from "react"
import type { StyleProp, ViewStyle } from "react-native"
import { Surface } from "@/ui/primitives"
import { useTheme } from "@/ui/theme"
import { useQuality } from "@/ui/quality/useQuality"

type Props = {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  tone?: "default" | "elevated" | "glow" | "warning"
  testID?: string
}

export function Card({ children, style, tone = "default", testID }: Props) {
  const { colors } = useTheme()
  const q = useQuality()

  const borderColor =
    tone === "glow"
      ? "rgba(255, 61, 206, 0.28)"
      : tone === "warning"
        ? "rgba(255, 176, 32, 0.40)"
        : colors.border

  return (
    <Surface
      testID={testID}
      tone={tone === "default" ? "default" : "raised"}
      padding={16}
      style={[
        {
          borderWidth: 1,
          borderColor,
        },
        tone === "glow"
          ? {
              shadowColor: "#FF3DCE",
              shadowOpacity: 0.22 * q.shadowScale,
              shadowRadius: 22 * q.shadowScale,
              shadowOffset: { width: 0, height: 10 },
            }
          : null,
        style as any,
      ]}
    >
      {children}
    </Surface>
  )
}
