import React from 'react'
import { ViewStyle, StyleProp } from 'react-native'
import { Stack, Text } from '../../primitives'

export function EmptyState({ title, message, style, testID }: { title: string; message?: string; style?: StyleProp<ViewStyle>; testID?: string }) {
  return (
    <Stack testID={testID} gap={8} align="center" style={[{ padding: 16 }, style]}>
      <Text weight="bold" size="lg" style={{ textAlign: 'center' }}>
        {title}
      </Text>
      {message ? (
        <Text tone="muted" style={{ textAlign: 'center' }}>
          {message}
        </Text>
      ) : null}
    </Stack>
  )
}
