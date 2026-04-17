import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Button } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'

const meta: Meta<typeof Screen> = {
  title: 'Patterns/Screens/ScenarioStates',
  component: Screen,
}

export default meta

type Story = StoryObj<typeof meta>

export const LoadingErrorDisabledPressedMatrix: Story = {
  render: () => (
    <Screen scroll>
      <Card tone="elevated">
        <Text preset="h3">Loading</Text>
        <Text preset="muted">Analyzing microphone quality...</Text>
        <Button text="Please wait" variant="secondary" disabled />
      </Card>

      <Card tone="warning">
        <Text preset="h3">Error</Text>
        <Text preset="muted">Permission blocked. Enable microphone access in settings.</Text>
        <Button text="Retry Permission" />
      </Card>

      <Card tone="default">
        <Text preset="h3">Disabled</Text>
        <Text preset="muted">Action disabled until required fields are complete.</Text>
        <Button text="Continue" variant="ghost" disabled />
      </Card>

      <Card tone="glow">
        <Text preset="h3">Pressed Simulation</Text>
        <Text preset="muted">Use on-device Storybook to press and inspect interaction states.</Text>
        <Button text="Press Me" />
      </Card>
    </Screen>
  ),
}

export const Default = LoadingErrorDisabledPressedMatrix
export const Empty = Default
export const Success = Default
