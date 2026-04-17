import React from 'react'
import { SandboxScreenShell } from '@/components/shared'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'

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
        <Text preset="h3">Run this command</Text>
        <Text preset="body">npm run storybook</Text>
        <Text preset="muted">
          For in-app route usage keep `EXPO_PUBLIC_STORYBOOK_ENABLED=true` and `EXPO_PUBLIC_STORYBOOK_ROOT=false`.
        </Text>
      </Card>

      <Card>
        <Text preset="h3">Quick launch shortcuts</Text>
        <Text preset="body">npm run storybook:ios</Text>
        <Text preset="body">npm run storybook:android</Text>
      </Card>
    </SandboxScreenShell>
  )
}
