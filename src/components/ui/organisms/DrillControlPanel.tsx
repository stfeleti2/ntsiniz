import React from 'react'
import { View } from 'react-native'
import { Card } from '@/components/ui/molecules/Card'
import { Heading } from '@/components/ui/atoms/Heading'
import { BodyText } from '@/components/ui/atoms/BodyText'
import { PrimaryButton, SecondaryButton } from '@/components/ui/atoms/Buttons'
import { useTheme } from '@/theme/provider'

export function DrillControlPanel({
  title = 'Drill Controls',
  status = 'Ready to sing',
  onStart,
  onPause,
}: {
  title?: string
  status?: string
  onStart?: () => void
  onPause?: () => void
}) {
  const { spacing } = useTheme()

  return (
    <Card tone="elevated">
      <View style={{ gap: spacing[2] }}>
        <Heading level={3}>{title}</Heading>
        <BodyText tone="muted">{status}</BodyText>
        <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
          <PrimaryButton label="Start" onPress={onStart} />
          <SecondaryButton label="Pause" onPress={onPause} />
        </View>
      </View>
    </Card>
  )
}
