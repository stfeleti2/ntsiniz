import { AppState } from 'react-native'
import { coreError } from '@/core/util/errors'
import { refreshCustomerInfoSafe, isRevenueCatConfigured } from './revenuecat'

/**
 * BillingBootstrap
 *
 * Goal: keep entitlements fresh without forcing a restart.
 * - refresh on app foreground
 * - exponential backoff on failures
 */
export function startBillingBootstrap(): () => void {
  if (!isRevenueCatConfigured()) return () => {}

  let stopped = false
  let retry = 0
  let timer: any = null

  const schedule = () => {
    if (stopped) return
    const ms = Math.min(60_000, 2_000 * Math.pow(2, retry))
    clearTimeout(timer)
    timer = setTimeout(() => {
      void refresh('timer')
    }, ms)
  }

  const refresh = async (source: 'foreground' | 'timer') => {
    if (stopped) return
    const info = await refreshCustomerInfoSafe().catch((e) => {
      coreError('billing_refresh_failed', { source, e })
      return null
    })
    if (info) {
      retry = 0
      return
    }
    retry = Math.min(6, retry + 1)
    schedule()
  }

  // Prime once.
  void refresh('timer')

  const sub = AppState.addEventListener('change', (s) => {
    if (s === 'active') void refresh('foreground')
  })

  return () => {
    stopped = true
    clearTimeout(timer)
    ;(sub as any)?.remove?.()
  }
}
