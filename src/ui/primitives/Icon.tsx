import React from 'react'
import { Text } from './Text'

// Placeholder icon wrapper (swap for a real icon set later)
export function Icon({ name, size = 16, testID }: { name: string; size?: number; testID?: string }) {
  return (
    <Text testID={testID} size="sm" style={{ fontSize: size, lineHeight: size }} accessibilityLabel={name}>
      {name}
    </Text>
  )
}
