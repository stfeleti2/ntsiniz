import React from "react"
import * as Haptics from "expo-haptics"
import type { ViewStyle } from "react-native"
import { Button as KitButton } from "@/ui/components/kit"

type Props = {
  text?: string
  title?: string
  children?: React.ReactNode
  onPress?: () => void
  disabled?: boolean
  variant?: "primary" | "secondary" | "ghost" | "soft"
  style?: ViewStyle
  haptic?: "none" | "light" | "medium"
  testID?: string
}

export function Button({ text, title, children, onPress, disabled, variant = "primary", style, haptic = "light", testID }: Props) {
  const mappedVariant = variant === "soft" || variant === "secondary" ? "secondary" : variant === "ghost" ? "ghost" : "primary"
  const label = text ?? title ?? (typeof children === "string" ? children : "")

  const doHaptic = async () => {
    if (disabled || haptic === "none") return
    try {
      if (haptic === "medium") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      else await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      // ignore
    }
  }

  return (
    <KitButton
      testID={testID}
      label={label}
      variant={mappedVariant as any}
      disabled={disabled}
      onPress={async () => {
        await doHaptic()
        onPress?.()
      }}
      style={style}
    />
  )
}
