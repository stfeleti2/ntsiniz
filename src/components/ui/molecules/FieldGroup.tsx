import React from 'react'
import { View } from 'react-native'
import { Heading } from '@/components/ui/atoms/Heading'
import { HelperText } from '@/components/ui/atoms/HelperText'
import { useTheme } from '@/theme/provider'

export function FieldGroup({
  title,
  hint,
  children,
}: {
  title?: string
  hint?: string
  children?: React.ReactNode
}) {
  const { spacing } = useTheme()

  return (
    <View style={{ gap: spacing[2] }}>
      {title ? <Heading level={3}>{title}</Heading> : null}
      {hint ? <HelperText>{hint}</HelperText> : null}
      <View style={{ gap: spacing[2] }}>{children}</View>
    </View>
  )
}
