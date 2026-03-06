import { useEffect, useState } from 'react'
import type { QualityConfig } from '@/core/perf/qualityTypes'
import { getQualityConfig, subscribeQuality } from '@/core/perf/qualityRuntime'

/**
 * UI hook for adaptive quality settings.
 * Premium visuals remain; effects degrade adaptively in LITE.
 */
export function useQuality(): QualityConfig {
  const [cfg, setCfg] = useState<QualityConfig>(() => getQualityConfig())

  useEffect(() => {
    return subscribeQuality((q) => setCfg(q.config))
  }, [])

  return cfg
}
