import React, { useEffect, useState } from 'react'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { decideMonetization } from '@/core/monetization/monetizationGate'
import { getMonetizationState, updateMonetizationState } from '@/core/monetization/monetizationState'

/**
 * Rewarded ads entry point (safe placement).
 * This is provider-agnostic; wire AdMob later.
 */
export function RewardedBoostCard() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    decideMonetization().then((d) => setEnabled(!!d.canRewarded))
  }, [])

  if (!enabled) return null

  return (
    <Card tone="glow">
      <Text preset="h2">{t('monet.rewarded.title') ?? 'Boost tomorrow'}</Text>
      <Text preset="muted">{t('monet.rewarded.body') ?? 'Watch 1 ad to add an extra drill to tomorrow’s plan.'}</Text>
      <Box style={{ height: 10 }} />
      <Button
        text={t('monet.rewarded.cta') ?? 'Watch & Boost'}
        onPress={async () => {
          // Stub behavior for now: mark as claimed.
          const cur = await getMonetizationState()
          await updateMonetizationState({ rewardedCount: (cur.rewardedCount ?? 0) + 1, lastRewardedAt: Date.now() })
          setEnabled(false)
        }}
      />
    </Card>
  )
}
