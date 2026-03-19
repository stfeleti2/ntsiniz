import React, { useEffect, useMemo, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box, Stack } from '@/ui/primitives'
import { t } from '@/app/i18n'
import { formatDate } from '@/core/i18n'
import { logger } from '@/core/observability/logger'
import { getAttemptById, type Attempt } from '@/core/storage/attemptsRepo'
import { loadAllBundledPacks } from '@/core/drills/loader'
import { useSoundPlayback } from '@/app/audio/useSoundPlayback'
import { useWaveformData } from '@/app/audio/useWaveformData'
import { TakeBadge } from '@/ui/patterns'
import { getBestTakeAttemptId } from '@/core/storage/bestTakesRepo'
import { WaveformPlayerModule } from '@/ui/modules'
import { useQuality } from '@/ui/quality/useQuality'
import { NextActionBar } from '@/ui/components/NextActionBar'
import { captureException } from '@/app/telemetry/sentry'
import { onInterruption } from '@/core/audio/interruptions'
import { routeBroker } from '@/core/audio/routeBroker'
import { PlaybackInsightCard } from '@/ui/guidedJourney'

type Props = NativeStackScreenProps<RootStackParamList, 'Playback'>
const copy = {
  bestMomentTitle: 'Best moment highlight',
}

export function PlaybackScreen({ navigation, route }: Props) {
  const { attemptId } = route.params
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [isBest, setIsBest] = useState(false)
  const [routeAlert, setRouteAlert] = useState<{ reason: string; atMs: number } | null>(null)

  const q = useQuality()

  const pack = useMemo(() => loadAllBundledPacks(), [])

  useEffect(() => {
    ;(async () => {
      const a = await getAttemptById(attemptId)
      setAttempt(a)
      if (a) {
        const bestId = await getBestTakeAttemptId(a.sessionId, a.drillId).catch(() => null)
        setIsBest(bestId === a.id)
      }
    })().catch((e) => captureException(e, { screen: 'Playback' }))
  }, [attemptId])

  const drillTitle = useMemo(() => {
    if (!attempt) return ''
    return pack.drills.find((d) => d.id === attempt.drillId)?.title ?? attempt.drillId
  }, [attempt, pack.drills])

  const audioUri = (attempt as any)?.metrics?.audioUri as string | undefined
  const pb = useSoundPlayback(audioUri)

  // Handle mid-playback route changes (e.g. Bluetooth disconnect) with the same rigor as recording.
  useEffect(() => {
    let lastChangedAt = routeBroker.getState().lastChangedAtMs
    return routeBroker.subscribe((s) => {
      if (!s.lastChangedAtMs || s.lastChangedAtMs === lastChangedAt) return
      lastChangedAt = s.lastChangedAtMs

      // Only interrupt if we are actively playing.
      if (pb.isPlaying) {
        pb.toggle().catch((e) => logger.warn('Playback toggle failed', e))
        const reason = s.route?.isBluetoothInput ? 'bluetooth' : 'route_changed'
        setRouteAlert({ reason, atMs: Date.now() })
      }
    })
  }, [pb])
  useEffect(() => {
    return onInterruption((e) => {
      if (e.type === 'app_state' && e.to !== 'active') {
        pb.unload()
      }
    })
  }, [pb])
  const wf = useWaveformData({ uri: audioUri ?? null, metrics: (attempt as any)?.metrics, bars: q.waveformBars })

  if (!attempt) {
    return (
      <Screen background="gradient">
        <Text preset="h1">{t('playback.title')}</Text>
        <Text preset="muted">{t('common.loading')}</Text>
        <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
      </Screen>
    )
  }

  const dateLabel = formatDate(attempt.createdAt, { dateStyle: 'medium', timeStyle: 'short' })
  const canSeek = !!audioUri && pb.isReady
  const guidedNote = (attempt as any)?.metrics?.guidedJourney?.coachTip as string | undefined

  return (
    <Screen scroll background="gradient">
      {routeAlert ? (
        <Card tone="elevated">
          <Text preset="h2">{t('playback.routeChanged.title') ?? 'Audio route changed'}</Text>
          <Text preset="muted">
            {routeAlert.reason === 'bluetooth'
              ? t('playback.routeChanged.bluetooth') ?? 'Your Bluetooth audio route changed. Playback was paused.'
              : t('playback.routeChanged.generic') ?? 'Your audio route changed. Playback was paused.'}
          </Text>
          <Box style={{ height: 10 }} />
          <Stack direction="horizontal" gap={8}>
            <Button
              text={t('playback.routeChanged.resume') ?? 'Resume'}
              onPress={() => {
                setRouteAlert(null)
                pb.toggle().catch((e) => logger.warn('Playback toggle failed', e))
              }}
            />
            <Button
              text={t('playback.routeChanged.chooseOutput') ?? 'Choose output'}
              variant="soft"
              onPress={() => {
                setRouteAlert(null)
                ;(navigation as any).navigate('MainTabs', { screen: 'Settings' })
              }}
            />
          </Stack>
        </Card>
      ) : null}

      <Stack direction="horizontal" justify="space-between" align="center">
        <Text preset="h1">{t('playback.title')}</Text>
        <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
      </Stack>

      <Card tone="glow">
        <Stack direction="horizontal" justify="space-between" align="center">
          <Stack gap={2} style={{ flex: 1 }}>
            <Text preset="h2">{drillTitle}</Text>
            <Text preset="muted">{t('playback.attemptMeta', { date: dateLabel })}</Text>
          </Stack>
          {isBest ? <TakeBadge status="best" /> : null}
        </Stack>

        <Box style={{ height: 12 }} />

        {audioUri ? (
          <WaveformPlayerModule
            testID="playback.player"
            loading={wf.loading}
            peaks={wf.data?.waveformPeaks ?? []}
            progress={pb.progress}
            progressLabel={pb.progressLabel}
            isPlaying={pb.isPlaying}
            onSeek={canSeek ? pb.seekToProgress : undefined}
            onToggle={audioUri && pb.isReady ? pb.toggle : undefined}
            onRestart={audioUri && pb.isReady ? () => pb.seekToMs(0) : undefined}
          />
        ) : (
          <Box style={{ height: 110, justifyContent: 'center', alignItems: 'center' }}>
            <Text preset="muted">{t('playback.noAudio')}</Text>
          </Box>
        )}

        <Box style={{ height: 8 }} />
        <Text preset="muted">{t('playback.seekHint')}</Text>
      </Card>

      {guidedNote ? <PlaybackInsightCard title={copy.bestMomentTitle} body={guidedNote} /> : null}

      <NextActionBar
        title={t('coach.nextActionTitle')}
        subtitle={t('coach.nextActionSubtitle')}
        primaryLabel={t('common.start')}
        onPrimary={() => navigation.navigate('Drill', { sessionId: attempt.sessionId, drillId: attempt.drillId })}
        secondaryLabel={t('results.title')}
        onSecondary={() => navigation.navigate('Results', { sessionId: attempt.sessionId })}
      />
    </Screen>
  )
}
