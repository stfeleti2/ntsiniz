import { Platform } from 'react-native'
import Constants from 'expo-constants'
import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesOffering } from 'react-native-purchases'
import { setEntitlementsFromRevenueCat } from './entitlementsRepo'
import { coreError } from '@/core/observability/logger'

type RevenueCatConfig = {
  iosApiKey: string
  androidApiKey: string
  entitlementPro: string
}

function getExtra(): Record<string, any> {
  const cfg: any = (Constants as any).expoConfig ?? (Constants as any).manifest ?? (Constants as any).manifest2
  return (cfg?.extra ?? {}) as Record<string, any>
}

export function getRevenueCatConfig(): RevenueCatConfig {
  const extra = getExtra()
  return {
    iosApiKey: String(extra.revenuecatIosApiKey ?? ''),
    androidApiKey: String(extra.revenuecatAndroidApiKey ?? ''),
    entitlementPro: String(extra.revenuecatEntitlementPro ?? 'pro'),
  }
}

export function isRevenueCatConfigured(): boolean {
  const c = getRevenueCatConfig()
  if (Platform.OS === 'ios') return Boolean(c.iosApiKey)
  if (Platform.OS === 'android') return Boolean(c.androidApiKey)
  // Web: leave optional — RevenueCat added RN-web support recently, but many teams gate this later.
  return false
}

let configured = false
let entitlementId = 'pro'

export async function initRevenueCat(): Promise<{ enabled: boolean }> {
  if (configured) return { enabled: true }
  const cfg = getRevenueCatConfig()
  entitlementId = cfg.entitlementPro || 'pro'

  const apiKey =
    Platform.OS === 'ios' ? cfg.iosApiKey :
    Platform.OS === 'android' ? cfg.androidApiKey :
    ''

  if (!apiKey) return { enabled: false }

  // In production you typically keep this at WARN.
  // In dev, DEBUG can help diagnose StoreKit/Play Billing issues.
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN)

  Purchases.configure({ apiKey })

  // Keep local entitlements in sync with RevenueCat.
  Purchases.addCustomerInfoUpdateListener((info) => {
    setEntitlementsFromRevenueCat(info, entitlementId).catch((e) => coreError('revenuecat_entitlements_sync_failed', { e }))
  })

  const info = await Purchases.getCustomerInfo().catch(() => null)
  if (info) await setEntitlementsFromRevenueCat(info, entitlementId).catch((e) => coreError('revenuecat_entitlements_sync_failed', { e }))

  configured = true
  return { enabled: true }
}

export async function getOfferingsSafe(): Promise<{ current: PurchasesOffering | null; all: any }>{
  if (!configured) {
    const init = await initRevenueCat()
    if (!init.enabled) return { current: null, all: null }
  }
  const offerings = await Purchases.getOfferings()
  return { current: offerings.current, all: offerings.all }
}

export async function purchasePackageSafe(pkg: any): Promise<CustomerInfo | null> {
  if (!configured) {
    const init = await initRevenueCat()
    if (!init.enabled) return null
  }
  const result = await Purchases.purchasePackage(pkg)
  return result.customerInfo ?? null
}

export async function restorePurchasesSafe(): Promise<CustomerInfo | null> {
  if (!configured) {
    const init = await initRevenueCat()
    if (!init.enabled) return null
  }
  const info = await Purchases.restorePurchases()
  return info ?? null
}

/**
 * Force-refresh CustomerInfo and sync local entitlements.
 * Useful for paywall/billing entry and to avoid "I paid but still locked" scenarios.
 */
export async function refreshCustomerInfoSafe(entitlementOverride?: string): Promise<CustomerInfo | null> {
  if (!configured) {
    const init = await initRevenueCat()
    if (!init.enabled) return null
  }
  const info = await Purchases.getCustomerInfo().catch(() => null)
  if (info) await setEntitlementsFromRevenueCat(info, entitlementOverride ?? entitlementId).catch((e) => coreError('revenuecat_entitlements_refresh_sync_failed', { e }))
  return info
}

export async function openManageSubscriptions(): Promise<void> {
  if (Platform.OS === 'ios') {
    // iOS has native UI for subscription management.
    await Purchases.showManageSubscriptions()
    return
  }
  if (Platform.OS === 'android') {
    // On Android, RevenueCat exposes helpers too.
    await Purchases.showManageSubscriptions()
    return
  }
}
