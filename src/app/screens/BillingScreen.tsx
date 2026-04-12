import React, { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { getEntitlements, setProEnabled, setEntitlementsFromRevenueCat } from '@/core/billing/entitlementsRepo'
import { getOfferingsSafe, isRevenueCatConfigured, purchasePackageSafe, restorePurchasesSafe, openManageSubscriptions, getRevenueCatConfig } from '@/core/billing/revenuecat'
import { reportUiError } from '@/app/telemetry/report'

/**
 * Production-ready Billing:
 * - If RevenueCat keys are configured (native), we show real offerings and purchase/restore flows.
 * - Otherwise, we fall back to a local Pro toggle (dev/demo mode).
 *
 * Notes:
 * - Real purchases require a development build (EAS) or store build; Expo Go runs in preview/mock mode.
 *   RevenueCat + Expo guidance: https://docs.expo.dev/guides/in-app-purchases/ and https://www.revenuecat.com/docs/getting-started/installation/expo
 */
export function BillingScreen() {
  const [pro, setPro] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rcEnabled, setRcEnabled] = useState(false)
  const [packages, setPackages] = useState<any[]>([])
  const [error, setError] = useState<string>('')

  const platformLabel = Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web'

  useEffect(() => {
    ;(async () => {
      const e = await getEntitlements().catch(() => null)
      setPro(!!e?.pro)
      const enabled = isRevenueCatConfigured()
      setRcEnabled(enabled)
      if (enabled) {
        const { current } = await getOfferingsSafe().catch(() => ({ current: null }))
        const pkgs = current?.availablePackages ?? []
        setPackages(pkgs)
      }
    })().catch((e) => reportUiError(e))
  }, [])

  const devToggle = async () => {
    const next = !pro
    await setProEnabled(next)
    setPro(next)
  }

  const buy = async (pkg: any) => {
    setError('')
    setLoading(true)
    try {
      const info = await purchasePackageSafe(pkg)
      const entitlementId = getRevenueCatConfig().entitlementPro
      if (info) await setEntitlementsFromRevenueCat(info as any, entitlementId)
      const e = await getEntitlements()
      setPro(!!e?.pro)
    } catch (e: any) {
      setError(String(e?.message ?? e ?? 'Purchase failed'))
    } finally {
      setLoading(false)
    }
  }

  const restore = async () => {
    setError('')
    setLoading(true)
    try {
      const info = await restorePurchasesSafe()
      const entitlementId = getRevenueCatConfig().entitlementPro
      if (info) await setEntitlementsFromRevenueCat(info as any, entitlementId)
      const e = await getEntitlements()
      setPro(!!e?.pro)
    } catch (e: any) {
      setError(String(e?.message ?? e ?? 'Restore failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen title={t('billing.title')} scroll>
      <Box gap={12}>
        <Card>
          <Box gap={8}>
            <Text size="lg" weight="semibold">
              {t('billing.proTitle')}
            </Text>
            <Text muted>{t('billing.proDesc')}</Text>

            <Card tone="elevated">
              <Box gap={6}>
                <Text weight="semibold">{t('billing.benefitsTitle')}</Text>
                <Text muted>{t('billing.benefit1')}</Text>
                <Text muted>{t('billing.benefit2')}</Text>
                <Text muted>{t('billing.benefit3')}</Text>
              </Box>
            </Card>

            <Box>
              <Text>
                {t('billing.status')}: <Text weight="semibold">{pro ? t('billing.statusPro') : t('billing.statusFree')}</Text>
              </Text>
            </Box>

            {rcEnabled ? (
              <Box gap={10}>
                <Text muted>
                  {t('billing.provider')}: RevenueCat ({platformLabel})
                </Text>

                <Text muted>{t('billing.trustLine')}</Text>

                {packages.length === 0 ? (
                  <Text muted>{t('billing.noPackages')}</Text>
                ) : (
                  <Box gap={8}>
                    {packages.map((p) => {
                      const id = p?.identifier ?? p?.packageType ?? 'pkg'
                      const price = p?.product?.priceString ?? ''
                      const title = p?.product?.title ?? t('billing.plan')
                      return (
                        <Card key={id}>
                          <Box gap={8}>
                            <Text weight="semibold">{title}</Text>
                            <Text muted>{price}</Text>
                            <Button title={loading ? t('common.loading') : t('billing.buy')} onPress={() => buy(p)} disabled={loading} />
                          </Box>
                        </Card>
                      )
                    })}
                  </Box>
                )}

                <Box row gap={10}>
                  <Button title={t('billing.restore')} onPress={restore} disabled={loading} />
                  <Button title={t('billing.manage')} onPress={() => openManageSubscriptions().catch(() => {})} disabled={loading} />
                </Box>

                {error ? <Text style={{ color: '#ff8a8a' }}>{error}</Text> : null}
              </Box>
            ) : (
              <Box gap={10}>
                <Text muted>{t('billing.rcNotConfigured')}</Text>
                {__DEV__ ? (
                  <Card>
                    <Box gap={8}>
                      <Text weight="semibold">{t('billing.devToggleTitle')}</Text>
                      <Text muted>{t('billing.devToggleDesc')}</Text>
                      <Button title={pro ? t('billing.disablePro') : t('billing.enablePro')} onPress={devToggle} />
                    </Box>
                  </Card>
                ) : (
                  <Text muted>{t('billing.contactSupport')}</Text>
                )}
              </Box>
            )}
          </Box>
        </Card>

        <Card>
          <Box gap={8}>
            <Text weight="semibold">{t('billing.noteTitle')}</Text>
            <Text muted>{t('billing.noteBody')}</Text>
          </Box>
        </Card>
      </Box>
    </Screen>
  )
}
