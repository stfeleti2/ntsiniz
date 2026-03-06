import { AppState } from 'react-native'
import { initCloudAuth } from './auth'
import { isCloudConfigured, getCloudConfig } from './config'
import { syncNow } from './syncEngine'
import { getQualityConfig } from '@/core/perf/qualityRuntime'
import { enableCloud } from '@/core/config/flags'
import { logger } from '@/core/observability/logger'

let started = false

export async function initCloudRuntime(): Promise<void> {
  if (started) return
  started = true
  if (!enableCloud()) return
  await initCloudAuth().catch((e) => logger.warn('suppressed error', e))

  const cfg = getCloudConfig()
  if (!cfg.cloudAutoSync) return

  let last = 0

  const maybe = async () => {
    if (!isCloudConfigured()) return
    const now = Date.now()
    const interval = getQualityConfig().backgroundWorkIntervalMs
    if (now - last < interval) return
    last = now
    await syncNow().catch((e) => logger.warn('suppressed error', e))
  }

  // sync once on init (if possible)
  await maybe()

  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      maybe().catch((e) => logger.warn('suppressed error', e))
    }
  })
}