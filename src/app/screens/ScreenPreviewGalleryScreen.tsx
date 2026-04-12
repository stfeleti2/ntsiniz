import React from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { View } from 'react-native'
import { orderedScreenPreviews } from '@/screens/previews'
import { SandboxScreenShell } from '@/components/shared'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
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
          <Text preset="h3">{preview.title}</Text>
          <Text preset="muted">{preview.description}</Text>
          <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
            <Button
              text="Open Preview"
              onPress={() => navigation.navigate('ScreenPreviewScenario', { scenario: preview.id })}
            />
            <Button
              text="Open in Flow Playground"
              variant="secondary"
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

