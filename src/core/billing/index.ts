import { initRevenueCat } from './revenuecat'

export async function initBilling() {
  // Safe no-op if keys not configured.
  await initRevenueCat().catch(() => ({ enabled: false }))
}
