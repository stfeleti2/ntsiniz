import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { ProgressBar } from '@/ui/components/ProgressBar'
import { Box } from '@/ui'
import { getDailyMissions } from '@/core/retention/missions'
import { setWeeklyGoalSessions } from '@/core/retention/stateRepo'
import { t } from '@/app/i18n'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'Missions'>

export function MissionsScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Awaited<ReturnType<typeof getDailyMissions>> | null>(null)

  const refresh = async () => {
    setLoading(true)
    try {
      setData(await getDailyMissions())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh().catch((e) => reportUiError(e))
  }, [])

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('missions.title')}</Text>
        <Text preset="muted">{t('missions.subtitle')}</Text>
      </Box>

      <Card tone="glow">
        <Text preset="h2">{t('missions.thisWeek')}</Text>
        {data ? (
          <>
            <Box style={{ marginTop: 10, gap: 8 }}>
              <ProgressBar pct={data.weekly.pct} />
              <Text preset="muted">{data.weekly.doneSessions} / {data.weekly.goalSessions} sessions</Text>
            </Box>
            <Box style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <Button
                text="Goal: 3"
                variant={data.weekly.goalSessions === 3 ? 'soft' : 'ghost'}
                onPress={() => setWeeklyGoalSessions(3).then(refresh)}
              />
              <Button
                text="Goal: 5"
                variant={data.weekly.goalSessions === 5 ? 'soft' : 'ghost'}
                onPress={() => setWeeklyGoalSessions(5).then(refresh)}
              />
              <Button
                text="Goal: 7"
                variant={data.weekly.goalSessions === 7 ? 'soft' : 'ghost'}
                onPress={() => setWeeklyGoalSessions(7).then(refresh)}
              />
            </Box>
          </>
        ) : (
          <Text preset="muted" style={{ marginTop: 10 }}>{loading ? t('common.loading') : '—'}</Text>
        )}
      </Card>

      <Card>
        <Text preset="h2">{t('missions.today')}</Text>
        {data ? (
          <Box style={{ marginTop: 10, gap: 10 }}>
            {data.missions.map((m, idx) => (
              <Card key={`${m.id}-${idx}`} tone={m.done ? 'glow' : 'default'}>
                <Text preset="body" style={{ fontWeight: '900' }}>{m.done ? '✅ ' : '🎯 '}{m.title}</Text>
                <Text preset="muted">{m.subtitle}</Text>
                {typeof m.pct === 'number' ? (
                  <Box style={{ marginTop: 10 }}>
                    <ProgressBar pct={Math.round((m.pct ?? 0) * 100)} />
                  </Box>
                ) : null}

                {!m.done && m.cta ? (
                  <Box style={{ marginTop: 10 }}>
                    <Button
                      text={m.cta.label}
                      onPress={() => {
                        if (m.cta?.kind === 'startSession') (navigation as any).navigate('Session')
                        else if (m.cta?.kind === 'openCommunity') (navigation as any).navigate('MainTabs', { screen: 'Community' })
                        else if (m.cta?.kind === 'openBilling') (navigation as any).navigate('Billing')
                        else navigation.goBack()
                      }}
                    />
                  </Box>
                ) : null}
              </Card>
            ))}
          </Box>
        ) : (
          <Text preset="muted" style={{ marginTop: 10 }}>{loading ? t('common.loading') : '—'}</Text>
        )}
      </Card>

      <Button text={t('common.refresh')} variant="soft" onPress={() => refresh().catch((e) => reportUiError(e))} />
      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
