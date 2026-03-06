import React from "react"
import type { TextStyle } from "react-native"
import { Text as UiText, type TextProps as PrimitiveTextProps } from "@/ui/primitives"

type Preset = "h1" | "h2" | "h3" | "body" | "muted" | "mono" | "caption"

const presetMap: Record<Preset, { size: PrimitiveTextProps["size"]; weight: PrimitiveTextProps["weight"]; tone?: PrimitiveTextProps["tone"]; style?: TextStyle }> = {
  h1: { size: "2xl", weight: "bold" },
  h2: { size: "lg", weight: "bold" },
  h3: { size: "md", weight: "semibold" },
  body: { size: "md", weight: "medium" },
  muted: { size: "sm", weight: "medium", tone: "muted" },
  mono: { size: "sm", weight: "medium", style: { fontFamily: "Courier" } },
  caption: { size: "xs", weight: "medium", tone: "muted" },
}

export function Text({
  children,
  preset = "body",
  size,
  weight,
  tone,
  muted,
  style,
  numberOfLines,
  testID,
  ...rest
}: Omit<PrimitiveTextProps, "size" | "weight" | "tone"> & {
  preset?: Preset
  size?: PrimitiveTextProps["size"]
  weight?: PrimitiveTextProps["weight"]
  tone?: PrimitiveTextProps["tone"]
  muted?: boolean
}) {
  const p = presetMap[preset]
  const resolvedTone = muted ? "muted" : tone ?? p.tone
  return (
    <UiText
      testID={testID}
      numberOfLines={numberOfLines}
      size={size ?? p.size}
      weight={weight ?? p.weight}
      tone={resolvedTone}
      style={[p.style, style]}
      {...rest}
    >
      {children}
    </UiText>
  )
}
