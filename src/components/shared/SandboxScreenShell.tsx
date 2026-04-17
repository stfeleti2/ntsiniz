import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView, View } from 'react-native'
import { useTheme } from '@/theme/provider'
import { Text } from '@/ui/components/Typography'

export function SandboxScreenShell({
  title,
  subtitle,
  children,
  scroll = true,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  scroll?: boolean
}) {
  const { colors, spacing } = useTheme()
  const content = (
    <View style={{ paddingHorizontal: spacing[4], paddingVertical: spacing[4], gap: spacing[3] }}>
      <View style={{ gap: spacing[1] }}>
        <Text preset="h2">{title}</Text>
        {subtitle ? <Text preset="muted">{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {scroll ? <ScrollView>{content}</ScrollView> : content}
    </SafeAreaView>
  )
}

