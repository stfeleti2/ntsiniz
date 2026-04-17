import React, { useEffect, useMemo, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { usePro } from '@/core/billing/usePro'
import { getOfferingsSafe, isRevenueCatConfigured, purchasePackageSafe, restorePurchasesSafe, openManageSubscriptions, getRevenueCatConfig, refreshCustomerInfoSafe } from '@/core/billing/revenuecat'
import { getEntitlements, setEntitlementsFromRevenueCat, setProEnabled } from '@/core/billing/entitlementsRepo'

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>

function copyForReason(reason?: string) {
  switch (reason) {
    case 'program':
      return { title: t('paywall.reason.programTitle'), body: t('paywall.reason.programBody') }
    case 'performance':
      return { title: t('paywall.reason.performanceTitle'), body: t('paywall.reason.performanceBody') }
    case 'advancedHud':
      return { title: t('paywall.reason.advancedHudTitle'), body: t('paywall.reason.advancedHudBody') }
    default:
      return { title: t('paywall.title'), body: t('paywall.subtitle') }
  }
}

export function PaywallScreen({ navigation, route }: Props) {
  const reason = route.params?.reason
  const { isPro, refreshing, refresh } = usePro()
  const [loading, setLoading] = useState(false)
  const [rcEnabled, setRcEnabled] = useState(false)
  const [packages, setPackages] = useState<any[]>([])
  const [error, setError] = useState<string>('')

  const copy = useMemo(() => copyForReason(reason), [reason])

  useEffect(() => {
    // If Pro becomes active while paywall open, close it.
    if (isPro) {
      navigation.goBack()
    }
  }, [isPro])

  useEffect(() => {
    ;(async () => {
      const enabled = isRevenueCatConfigured()
      setRcEnabled(enabled)
      if (enabled) {
        await refreshCustomerInfoSafe(getRevenueCatConfig().entitlementPro).catch(() => null)
        const { current } = await getOfferingsSafe().catch(() => ({ current: null }))
        setPackages(current?.availablePackages ?? [])
      }
    })().catch(() => {})
  }, [])

  const buy = async (pkg: any) => {
    setError('')
    setLoading(true)
    try {
      const info = await purchasePackageSafe(pkg)
      const entitlementId = getRevenueCatConfig().entitlementPro
      if (info) await setEntitlementsFromRevenueCat(info as any, entitlementId)
      await refresh()
    } catch (e: any) {
      setError(String(e?.message ?? e ?? t('paywall.purchaseFailed')))
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
      await refresh()
    } catch (e: any) {
      setError(String(e?.message ?? e ?? t('paywall.restoreFailed')))
    } finally {
      setLoading(false)
    }
  }

  const devToggle = async () => {
    const e = await getEntitlements().catch(() => null)
    const next = !(e?.pro ?? false)
    await setProEnabled(next)
  }

  return (
    <Screen title={t('paywall.navTitle')} scroll background="gradient">
      <Box gap={12}>
        <Card tone="glow">
          <Box gap={8}>
            <Text preset="h1">{copy.title}</Text>
            <Text preset="muted">{copy.body}</Text>
            <Card tone="elevated">
              <Box gap={6}>
                <Text weight="semibold">{t('paywall.benefitsTitle')}</Text>
                <Text muted>{t('paywall.benefit1')}</Text>
                <Text muted>{t('paywall.benefit2')}</Text>
                <Text muted>{t('paywall.benefit3')}</Text>
              </Box>
            </Card>
          </Box>
        </Card>

        {rcEnabled ? (
          <Card>
            <Box gap={10}>
              <Text muted>{t('paywall.choosePlan')}</Text>
              {packages.length === 0 ? (
                <Text muted>{t('paywall.noPackages')}</Text>
              ) : (
                <Box gap={8}>
                  {packages.map((p) => {
                    const id = p?.identifier ?? p?.packageType ?? 'pkg'
                    const price = p?.product?.priceString ?? ''
                    const title = p?.product?.title ?? t('paywall.plan')
                    const desc = p?.product?.description ?? ''
                    return (
                      <Card key={id}>
                        <Box gap={8}>
                          <Text weight="semibold">{title}</Text>
                          {desc ? <Text muted>{desc}</Text> : null}
                          <Text muted>{price}</Text>
                          <Button
                            title={loading ? t('common.loading') : t('paywall.unlock')}
                            onPress={() => buy(p)}
                            disabled={loading || refreshing}
                          />
                        </Box>
                      </Card>
                    )
                  })}
                </Box>
              )}

              <Box row gap={10}>
                <Button title={t('paywall.restore')} onPress={restore} disabled={loading || refreshing} />
                <Button title={t('paywall.manage')} onPress={() => openManageSubscriptions().catch(() => {})} disabled={loading || refreshing} />
              </Box>

              {error ? <Text style={{ color: '#ff8a8a' }}>{error}</Text> : null}
            </Box>
          </Card>
        ) : (
          <Card>
            <Box gap={10}>
              <Text muted>{t('paywall.rcNotConfigured')}</Text>
              {__DEV__ ? (
                <Button title={t('paywall.devToggle')} onPress={devToggle} />
              ) : (
                <Text muted>{t('paywall.contactSupport')}</Text>
              )}
            </Box>
          </Card>
        )}

        <Button title={t('common.notNow')} variant="ghost" onPress={() => navigation.goBack()} />
      </Box>
    </Screen>
  )
}
