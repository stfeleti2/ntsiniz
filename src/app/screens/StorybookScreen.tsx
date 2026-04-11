import React from 'react'
import { SandboxScreenShell } from '@/components/shared'
import { Card } from '@/components/ui/molecules'
import { Heading, BodyText } from '@/components/ui/atoms'

function tryLoadStorybook() {
  if (!__DEV__) return null
  if (process.env.EXPO_PUBLIC_STORYBOOK_ENABLED !== 'true') return null

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../../.rnstorybook').default as React.ComponentType
  } catch {
    return null
  }
}

export function StorybookScreen() {
  const StorybookRoot = React.useMemo(() => tryLoadStorybook(), [])

  if (StorybookRoot) return <StorybookRoot />

  return (
    <SandboxScreenShell
      title="Storybook is Disabled"
      subtitle="Start Metro in Storybook mode to bundle component stories and on-device addons."
    >
      <Card tone="warning">
        <Heading level={3}>Run this command</Heading>
        <BodyText>npm run storybook</BodyText>
        <BodyText tone="muted">
          For in-app route usage keep `EXPO_PUBLIC_STORYBOOK_ENABLED=true` and `EXPO_PUBLIC_STORYBOOK_ROOT=false`.
        </BodyText>
      </Card>

      <Card>
        <Heading level={3}>Quick launch shortcuts</Heading>
        <BodyText>npm run storybook:ios</BodyText>
        <BodyText>npm run storybook:android</BodyText>
      </Card>
    </SandboxScreenShell>
  )
}
