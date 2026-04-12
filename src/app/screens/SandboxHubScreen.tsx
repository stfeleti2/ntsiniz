import React from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { View } from 'react-native'
import { SandboxScreenShell } from '@/components/shared'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { useTheme } from '@/theme/provider'
import type { RootStackParamList } from '../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'SandboxHub'>

export function SandboxHubScreen({ navigation }: Props) {
  const { spacing } = useTheme()

  return (
    <SandboxScreenShell
      title="UI Sandbox"
      subtitle="Fast experimentation lane for components, full screens, and flow variants."
    >
      <Card tone="glow">
        <Text preset="h3">Component Playground</Text>
        <Text preset="muted">Build reusable atoms, molecules, and organisms in isolation.</Text>
        <Button
          text="Open Component Playground"
          onPress={() => navigation.navigate('ComponentPlayground')}
          testID="sandbox.open.components"
        />
      </Card>

      <Card tone="elevated">
        <Text preset="h3">Flow Playground</Text>
        <Text preset="muted">Switch instantly between mock and real-navigation flow checks.</Text>
        <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
          <Button
            text="Open Flow Playground"
            onPress={() => navigation.navigate('FlowPlayground')}
            testID="sandbox.open.flows"
          />
          <Button
            text="Onboarding"
            variant="secondary"
            onPress={() =>
              navigation.navigate('FlowPlayground', {
                scenario: 'onboarding',
                source: 'mock',
              })
            }
          />
          <Button
            text="Singing Start"
            variant="secondary"
            onPress={() =>
              navigation.navigate('FlowPlayground', {
                scenario: 'singing-start',
                source: 'mock',
              })
            }
          />
        </View>
      </Card>

      <Card>
        <Text preset="h3">Screen Previews</Text>
        <Text preset="muted">Open full-screen mocked containers without touching production flow.</Text>
        <Button
          text="Open Screen Preview Gallery"
          onPress={() => navigation.navigate('ScreenPreviewGallery')}
          testID="sandbox.open.screen-previews"
        />
      </Card>

      <Card>
        <Text preset="h3">Storybook</Text>
        <Text preset="muted">Component-first build lane with controls and decorators.</Text>
        <Button
          text="Open Storybook Screen"
          onPress={() => navigation.navigate('StorybookScreen')}
          testID="sandbox.open.storybook"
        />
      </Card>
    </SandboxScreenShell>
  )
}
