import React from 'react'
import { View } from 'react-native'
import { useTheme } from '@/theme/provider'
import { Heading } from '@/components/ui/atoms/Heading'
import { BodyText } from '@/components/ui/atoms/BodyText'

export type StatusTone = 'info' | 'success' | 'warning' | 'danger'

export function StatusBanner({
  title,
  body,
  tone = 'info',
  testID,
}: {
  title: string
  body?: string
  tone?: StatusTone
  testID?: string
}) {
  const { colors, radius } = useTheme()
  const backgroundColor =
    tone === 'success'
      ? 'rgba(53, 148, 101, 0.24)'
      : tone === 'warning'
        ? 'rgba(207, 138, 47, 0.2)'
        : tone === 'danger'
          ? 'rgba(217, 65, 115, 0.2)'
          : 'rgba(93, 117, 190, 0.22)'

  const borderColor =
    tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : tone === 'danger' ? colors.danger : colors.secondary

  return (
    <View
      testID={testID}
      style={{
        borderWidth: 1,
        borderColor,
        borderRadius: radius[3],
        padding: 12,
        gap: 6,
        backgroundColor,
      }}
    >
      <Heading level={3}>{title}</Heading>
      {body ? <BodyText tone="muted">{body}</BodyText> : null}
    </View>
  )
}
