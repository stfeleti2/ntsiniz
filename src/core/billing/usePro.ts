import { useEffect, useMemo, useState } from 'react'
import { getEntitlements, subscribeEntitlements, type Entitlements } from './entitlementsRepo'
import { isRevenueCatConfigured, refreshCustomerInfoSafe, getRevenueCatConfig } from './revenuecat'

export type ProState = {
  isPro: boolean
  proUntilMs: number | null
  source: Entitlements['source']
  syncedAtMs: number | null
  refreshing: boolean
  refresh: () => Promise<void>
}

function computeIsPro(e: Entitlements): boolean {
  if (e.proUntilMs && Date.now() > e.proUntilMs) return false
  return !!e.pro
}

export function usePro(): ProState {
  const [e, setE] = useState<Entitlements>({ pro: false, proUntilMs: null, source: 'local', syncedAtMs: null })
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    let mounted = true
    getEntitlements()
      .then((x) => mounted && setE(x))
      .catch(() => {})
    const unsub = subscribeEntitlements((x) => mounted && setE(x))
    return () => {
      mounted = false
      unsub()
    }
  }, [])

  const refresh = async () => {
    if (!isRevenueCatConfigured()) return
    setRefreshing(true)
    try {
      // Force a customer-info refresh and let the RevenueCat listener update local entitlements.
      const entitlementId = getRevenueCatConfig().entitlementPro
      await refreshCustomerInfoSafe(entitlementId)
    } finally {
      setRefreshing(false)
    }
  }

  const isPro = useMemo(() => computeIsPro(e), [e.pro, e.proUntilMs])

  return {
    isPro,
    proUntilMs: e.proUntilMs ?? null,
    source: e.source,
    syncedAtMs: e.syncedAtMs ?? null,
    refreshing,
    refresh,
  }
}
