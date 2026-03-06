import React from 'react'
import { Pressable, View } from 'react-native'
import { Text } from './Typography'
import type { RouteInfo } from '@/core/audio/routeManager'

function labelForRoute(route: RouteInfo | null): string {
  if (!route) return '…'
  const t = route.routeType
  if (t === 'built_in_mic') return 'Built-in mic'
  if (t === 'wired_headset') return 'Headset mic'
  if (t === 'bluetooth_sco') return 'Bluetooth mic'
  if (t === 'bluetooth_a2dp') return 'Bluetooth (output)'
  if (t === 'bluetooth_le') return 'Bluetooth LE mic'
  return 'Unknown input'
}

export function AudioRoutePill({ route, onPress }: { route: RouteInfo | null; onPress?: () => void }) {
  const label = labelForRoute(route)
  const warn = route?.isBluetoothInput
  return (
    <Pressable onPress={onPress} style={{ alignSelf: 'flex-start' }} accessibilityRole="button">
      <View style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: warn ? 'rgba(255,120,120,0.6)' : 'rgba(255,255,255,0.18)',
        backgroundColor: warn ? 'rgba(255,80,80,0.08)' : 'rgba(255,255,255,0.06)',
      }}>
        <Text style={{ fontSize: 12, opacity: 0.9 }}>{label}</Text>
      </View>
    </Pressable>
  )
}
