import React from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { View } from 'react-native'
import { SandboxScreenShell } from '@/components/shared'
import { Card } from '@/components/ui/molecules'
import { Heading, BodyText, PrimaryButton, SecondaryButton } from '@/components/ui/atoms'
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
        <Heading level={3}>Component Playground</Heading>
        <BodyText tone="muted">Build reusable atoms, molecules, and organisms in isolation.</BodyText>
        <PrimaryButton
          label="Open Component Playground"
          onPress={() => navigation.navigate('ComponentPlayground')}
          testID="sandbox.open.components"
        />
      </Card>

      <Card tone="elevated">
        <Heading level={3}>Flow Playground</Heading>
        <BodyText tone="muted">Switch instantly between mock and real-navigation flow checks.</BodyText>
        <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
          <PrimaryButton
            label="Open Flow Playground"
            onPress={() => navigation.navigate('FlowPlayground')}
            testID="sandbox.open.flows"
          />
          <SecondaryButton
            label="Onboarding"
            onPress={() =>
              navigation.navigate('FlowPlayground', {
                scenario: 'onboarding',
                source: 'mock',
              })
            }
          />
          <SecondaryButton
            label="Singing Start"
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
        <Heading level={3}>Screen Previews</Heading>
        <BodyText tone="muted">Open full-screen mocked containers without touching production flow.</BodyText>
        <PrimaryButton
          label="Open Screen Preview Gallery"
          onPress={() => navigation.navigate('ScreenPreviewGallery')}
          testID="sandbox.open.screen-previews"
        />
      </Card>

      <Card>
        <Heading level={3}>Storybook</Heading>
        <BodyText tone="muted">Component-first build lane with controls and decorators.</BodyText>
        <PrimaryButton
          label="Open Storybook Screen"
          onPress={() => navigation.navigate('StorybookScreen')}
          testID="sandbox.open.storybook"
        />
      </Card>
    </SandboxScreenShell>
  )
}
