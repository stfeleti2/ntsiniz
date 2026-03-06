import React, { useMemo, useState } from 'react'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { loadCompetitionsPack } from '@/core/competitions/loader'
import { loadMarketplaceCoaches, loadMarketplacePrograms } from '@/core/marketplace/loader'
import { t } from '@/app/i18n'

/**
 * “Content ops” without a heavy admin backend.
 * This screen is dev-facing (reachable from Settings dev section).
 */
export function AdminContentScreen({ navigation }: any) {
  const [tick, setTick] = useState(0)
  const pack = useMemo(() => loadCompetitionsPack(), [tick])
  const competitions = useMemo(() => (pack.seasons?.[0] as any)?.competitions ?? [], [pack])
  const coaches = useMemo(() => loadMarketplaceCoaches().coaches, [tick])
  const programs = useMemo(() => loadMarketplacePrograms().programs, [tick])

  const featuredCompetitions = competitions.filter((c: any) => c.featured)
  const featuredCoaches = coaches.filter((c: any) => c.featured)
  const featuredPrograms = programs.filter((p: any) => p.featured)

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('adminContent.title')}</Text>
        <Text preset="muted">{t('adminContent.subtitle')}</Text>
      </Box>

      <Card tone="glow">
        <Text preset="h2">{t('adminContent.featured')}</Text>
        <Text preset="muted">
          {t('adminContent.featuredHint')}
        </Text>
      </Card>

      <Card>
        <Text preset="h2">{t('adminContent.competitions')}</Text>
        {(featuredCompetitions.length ? featuredCompetitions : competitions.slice(0, 3)).map((c: any) => (
          <Box key={c.id} style={{ paddingVertical: 6 }}>
            <Text preset="body" style={{ fontWeight: '900' }}>{c.title}</Text>
            <Text preset="muted">{c.featured ? t('adminContent.featuredTag') : t('adminContent.notFeaturedTag')}</Text>
          </Box>
        ))}
      </Card>

      <Card>
        <Text preset="h2">{t('adminContent.coaches')}</Text>
        {(featuredCoaches.length ? featuredCoaches : coaches.slice(0, 3)).map((c: any) => (
          <Box key={c.id} style={{ paddingVertical: 6 }}>
            <Text preset="body" style={{ fontWeight: '900' }}>{c.name}</Text>
            <Text preset="muted">{c.featured ? t('adminContent.featuredTag') : t('adminContent.notFeaturedTag')}</Text>
          </Box>
        ))}
      </Card>

      <Card>
        <Text preset="h2">{t('adminContent.programs')}</Text>
        {(featuredPrograms.length ? featuredPrograms : programs.slice(0, 3)).map((p: any) => (
          <Box key={p.id} style={{ paddingVertical: 6 }}>
            <Text preset="body" style={{ fontWeight: '900' }}>{p.title}</Text>
            <Text preset="muted">{p.featured ? t('adminContent.featuredTag') : t('adminContent.notFeaturedTag')}</Text>
          </Box>
        ))}
      </Card>

      <Box style={{ flexDirection: 'row', gap: 10 }}>
        <Button text={t('adminContent.refresh')} variant="soft" onPress={() => setTick((x) => x + 1)} />
        <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack?.()} />
      </Box>
    </Screen>
  )
}
