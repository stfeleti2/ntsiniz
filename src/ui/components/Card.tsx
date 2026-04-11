import React from "react"
import type { StyleProp, ViewStyle } from "react-native"
import { useWindowDimensions } from "react-native"
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
  const { colors, breakpoints } = useTheme()
  const q = useQuality()
  const { width } = useWindowDimensions()
  const padding = width >= breakpoints.tabletLg ? 20 : width >= breakpoints.tablet ? 18 : 16

  const accentRole = tone === 'warning' ? 'warning' : tone === 'glow' ? 'primary' : undefined
  const depth = tone === 'default' ? 'flat' : tone === 'warning' ? 'pressed' : 'raised'
  const mode = tone === 'glow' ? 'glass' : tone === 'default' ? 'default' : 'raised'

  return (
    <Surface
      testID={testID}
      tone={mode}
      depth={depth}
      accentRole={accentRole}
      padding={padding}
      style={[
        {
          borderWidth: 1,
          borderColor: tone === 'warning' ? 'rgba(255, 215, 158, 0.58)' : tone === 'glow' ? 'rgba(191, 182, 255, 0.5)' : colors.border,
          backgroundColor:
            tone === 'warning'
              ? 'rgba(56, 41, 29, 0.94)'
              : tone === 'glow'
                ? 'rgba(37, 45, 72, 0.52)'
                : tone === 'elevated'
                  ? colors.surfaceRaised
                  : colors.surfaceBase,
        },
        tone === "glow"
          ? {
              shadowColor: colors.accentLavender,
              shadowOpacity: 0.32 * q.shadowScale,
              shadowRadius: 26 * q.shadowScale,
              shadowOffset: { width: 0, height: 14 },
            }
          : tone === 'warning'
            ? {
                shadowColor: colors.warning,
                shadowOpacity: 0.24 * q.shadowScale,
                shadowRadius: 16 * q.shadowScale,
                shadowOffset: { width: 0, height: 8 },
            }
          : null,
        style as any,
      ]}
    >
      {children}
    </Surface>
  )
}
