import React from 'react'
import { Box, Pressable, Text } from '@/ui/primitives'

type Props = {
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
  onActionPress?: () => void
  testID?: string
}

/**
 * Reusable section header with optional right-side action.
 * UI-only (no business logic).
 */
export function SectionHeaderModule({ title, subtitle, actionLabel, onAction, onActionPress, testID }: Props) {
  const handleAction = onAction ?? onActionPress
  return (
    <Box testID={testID} style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
      <Box style={{ flex: 1, gap: 2 }}>
        <Text weight="bold" size="md">
          {title}
        </Text>
        {subtitle ? (
          <Text tone="muted" size="sm">
            {subtitle}
          </Text>
        ) : null}
      </Box>
      {actionLabel && handleAction ? (
        <Pressable
          onPress={handleAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          testID={testID ? `${testID}.action` : undefined}
          style={{ paddingHorizontal: 10, paddingVertical: 6 }}
        >
          <Text weight="bold" size="sm">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </Box>
  )
}
