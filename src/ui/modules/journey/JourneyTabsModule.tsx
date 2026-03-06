import React from 'react'
import { Box, Pressable, Stack, Text } from '@/ui/primitives'
import { Divider } from '@/ui/primitives/Divider'

export type JourneyTab = {
  key: string
  label: string
}

export type JourneyTabsModuleProps = {
  tabs: JourneyTab[]
  activeKey: string
  onChange: (key: string) => void
  testID?: string
}

/**
 * Simple tabs row used on Journey-like screens.
 * UI-only: the parent owns state.
 */
export function JourneyTabsModule({ tabs, activeKey, onChange, testID }: JourneyTabsModuleProps) {
  return (
    <Box testID={testID} style={{ gap: 8 }}>
      <Stack direction="horizontal" gap={12} align="center">
        {tabs.map((tab) => {
          const active = tab.key === activeKey
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChange(tab.key)}
              testID={testID ? `${testID}.tab.${tab.key}` : undefined}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{ paddingVertical: 8, paddingHorizontal: 10 }}
            >
              <Text weight={active ? 'bold' : 'medium'} tone={active ? 'default' : 'muted'}>
                {tab.label}
              </Text>
            </Pressable>
          )
        })}
      </Stack>
      <Divider />
    </Box>
  )
}
