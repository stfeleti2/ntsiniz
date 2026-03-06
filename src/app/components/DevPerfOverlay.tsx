import React from 'react'
import { View } from 'react-native'

import { Text } from '@/ui/components/Typography'
import { startPerfMonitor, subscribePerf } from '@/core/perf/perfMonitor'
import { t } from '@/core/i18n'
import { subscribeQuality } from '@/core/perf/qualityRuntime'

export function DevPerfOverlay() {
  const [s, setS] = React.useState({ stalls: 0, lastStallMs: 0, worstStallMs: 0, p95StallMs: 0, frameBusQueue: 0, frameBusDropped: 0 })
  const [q, setQ] = React.useState<{ mode: string; tier: string }>(() => ({ mode: 'BALANCED', tier: 'MID' }))

  React.useEffect(() => {
    startPerfMonitor()
    const unsubPerf = subscribePerf((next) =>
      setS({
        stalls: next.stalls,
        lastStallMs: next.lastStallMs,
        worstStallMs: next.worstStallMs,
        p95StallMs: next.p95StallMs,
        frameBusQueue: next.frameBusQueue ?? 0,
        frameBusDropped: next.frameBusDropped ?? 0,
      }),
    )
    const unsubQ = subscribeQuality((cfg) => setQ({ mode: cfg.mode, tier: cfg.tier }))
    return () => {
      unsubPerf()
      unsubQ()
    }
  }, [])

  // Keep it tiny + unobtrusive.
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        right: 10,
        top: 44,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.55)',
      }}
    >
      <Text preset="caption" style={{ opacity: 0.9 }}>
        {t('dev.perf.stalls', { count: s.stalls })}
      </Text>
      <Text preset="caption" style={{ opacity: 0.85 }}>
        {t('dev.perf.quality', { mode: q.mode, tier: q.tier })}
      </Text>
      {s.lastStallMs ? (
        <Text preset="caption" style={{ opacity: 0.8 }}>
          {t('dev.perf.stallDetail', { last: s.lastStallMs, p95: s.p95StallMs, worst: s.worstStallMs })}
        </Text>
      ) : null}
      {typeof s.frameBusQueue === 'number' ? (
        <Text preset="caption" style={{ opacity: 0.75 }}>
          {t('dev.perf.busDetail', { q: s.frameBusQueue, dropped: s.frameBusDropped })}
        </Text>
      ) : null}
    </View>
  )
}
