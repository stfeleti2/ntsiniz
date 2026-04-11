import React from 'react'
import { View } from 'react-native'
import { Heading } from '@/components/ui/atoms/Heading'
import { HelperText } from '@/components/ui/atoms/HelperText'
import { useTheme } from '@/theme/provider'

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { spacing } = useTheme()

  return (
    <View style={{ gap: spacing[1] }}>
      <Heading level={1}>{title}</Heading>
      {subtitle ? <HelperText>{subtitle}</HelperText> : null}
    </View>
  )
}
