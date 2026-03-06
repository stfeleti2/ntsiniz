import React from 'react'
import { View, Text } from 'react-native'
import { t } from '@/core/i18n'

export function MicLevelMeter(props: { peak?: number; clipped?: boolean }) {
  const peak = Math.max(0, Math.min(1, props.peak ?? 0))
  const clipped = !!props.clipped
  return (
    <View accessibilityLabel={t('recording.micLevelLabel')} style={{ gap: 6 }}>
      <View style={{ height: 8, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
        <View style={{ height: 8, width: `${Math.round(peak * 100)}%`, borderRadius: 99, backgroundColor: clipped ? '#ff4d4d' : 'rgba(255,255,255,0.7)' }} />
      </View>
      {clipped ? (
        <Text style={{ fontSize: 12, opacity: 0.9 }}>{t('recording.clippingWarning')}</Text>
      ) : (
        <Text style={{ fontSize: 12, opacity: 0.7 }}>{t('recording.clippingOk')}</Text>
      )}
    </View>
  )
}
