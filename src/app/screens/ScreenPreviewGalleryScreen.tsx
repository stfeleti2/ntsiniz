import React from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { View } from 'react-native'
import { orderedScreenPreviews } from '@/screens/previews'
import { SandboxScreenShell } from '@/components/shared'
import { Card } from '@/components/ui/molecules'
import { Heading, BodyText, PrimaryButton, SecondaryButton } from '@/components/ui/atoms'
import { useTheme } from '@/theme/provider'
import type { RootStackParamList } from '../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'ScreenPreviewGallery'>

export function ScreenPreviewGalleryScreen({ navigation }: Props) {
  const { spacing } = useTheme()

  return (
    <SandboxScreenShell
      title="Screen Preview Gallery"
      subtitle="Open full-screen mocked containers for welcome, drill, playback, and win flows."
    >
      {orderedScreenPreviews.map((preview) => (
        <Card key={preview.id} tone="elevated">
          <Heading level={3}>{preview.title}</Heading>
          <BodyText tone="muted">{preview.description}</BodyText>
          <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
            <PrimaryButton
              label="Open Preview"
              onPress={() => navigation.navigate('ScreenPreviewScenario', { scenario: preview.id })}
            />
            <SecondaryButton
              label="Open in Flow Playground"
              onPress={() =>
                navigation.navigate('FlowPlayground', {
                  scenario: preview.id === 'session-summary' ? 'singing-start' : 'onboarding',
                  source: 'mock',
                })
              }
            />
          </View>
        </Card>
      ))}
    </SandboxScreenShell>
  )
}

