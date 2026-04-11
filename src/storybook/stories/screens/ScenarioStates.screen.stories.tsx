import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-native'
import { Container, Card, StatusBanner } from '@/components/ui/molecules'
import { Heading, BodyText, PrimaryButton, SecondaryButton, GhostButton } from '@/components/ui/atoms'

const meta: Meta<typeof Container> = {
  title: 'Screens/ScenarioStates',
  component: Container,
}

export default meta

type Story = StoryObj<typeof meta>

export const LoadingErrorDisabledPressedMatrix: Story = {
  render: () => (
    <Container>
      <Card tone="elevated">
        <Heading level={3}>Loading</Heading>
        <BodyText tone="muted">Analyzing microphone quality...</BodyText>
        <SecondaryButton label="Please wait" disabled />
      </Card>

      <Card tone="warning">
        <Heading level={3}>Error</Heading>
        <StatusBanner tone="danger" title="Permission blocked" body="Enable microphone access in settings." />
        <PrimaryButton label="Retry Permission" />
      </Card>

      <Card tone="default">
        <Heading level={3}>Disabled</Heading>
        <BodyText tone="muted">Action disabled until required fields are complete.</BodyText>
        <GhostButton label="Continue" disabled />
      </Card>

      <Card tone="glow">
        <Heading level={3}>Pressed Simulation</Heading>
        <BodyText tone="muted">Use on-device Storybook to press and inspect interaction states.</BodyText>
        <PrimaryButton label="Press Me" />
      </Card>
    </Container>
  ),
}

