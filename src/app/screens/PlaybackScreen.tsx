import React, { useEffect, useMemo, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { LinearGradient } from 'expo-linear-gradient'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Box, Stack } from '@/ui/primitives'
import { formatDate } from '@/core/i18n'
import { BrandWorldBackdrop, CurrentZoneChip } from '@/ui/guidedJourney'
import { PremiumRangePracticePanel } from '@/ui/onboarding/PremiumRangePracticePanel'

import { logger } from '@/core/observability/logger'
import { getAttemptById, listAttemptsByDrill, type Attempt } from '@/core/storage/attemptsRepo'
import { loadAllBundledPacks } from '@/core/drills/loader'
import { useSoundPlayback } from '@/app/audio/useSoundPlayback'
import { useWaveformData } from '@/app/audio/useWaveformData'
import { TakeBadge } from '@/ui/patterns'
import { getBestTakeAttemptId, setBestTakeForAttempt } from '@/core/storage/bestTakesRepo'
import { WaveformPlayerModule } from '@/ui/modules'
import { useQuality } from '@/ui/quality/useQuality'
import { NextActionBar } from '@/ui/components/NextActionBar'
import { captureException } from '@/app/telemetry/sentry'
import { onInterruption } from '@/core/audio/interruptions'
import { routeBroker } from '@/core/audio/routeBroker'
import { t } from '@/app/i18n'

type Props = NativeStackScreenProps<RootStackParamList, 'Playback'>

const COPY = {
  title: 'Playback',
  loading: 'Loading take…',
  routeTitle: 'Audio route changed',
  routeBody: 'Playback was paused to keep output predictable.',
  resume: 'Resume',
  chooseOutput: 'Choose output',
  compare: 'Compare',
  compareOff: 'Hide compare',
  saveBest: 'Save best',
  savedBest: 'Saved as best',
  bestMoment: 'Best moment',
  share: 'Share',
  back: 'Back',
  nextTitle: 'What comes next',
  nextSubtitle: 'Save best and keep moving',
  next: 'Next',
  results: 'Results',
}

export function PlaybackScreen({ navigation, route }: Props) {
  const { attemptId } = route.params
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [isBest, setIsBest] = useState(false)
  const [bestAttempt, setBestAttempt] = useState<Attempt | null>(null)
  const [compareOn, setCompareOn] = useState(false)
  const [routeAlert, setRouteAlert] = useState(false)
  const [savedToast, setSavedToast] = useState(false)

  const q = useQuality()
  const pack = useMemo(() => loadAllBundledPacks(), [])

  useEffect(() => {
    ;(async () => {
      const currentAttempt = await getAttemptById(attemptId)
      setAttempt(currentAttempt)
      if (!currentAttempt) return
      const bestId = await getBestTakeAttemptId(currentAttempt.sessionId, currentAttempt.drillId).catch(() => null)
      setIsBest(bestId === currentAttempt.id)

      if (bestId && bestId !== currentAttempt.id) {
        const best = await getAttemptById(bestId).catch(() => null)
        setBestAttempt(best)
      } else if (!bestId) {
        const attempts = await listAttemptsByDrill(currentAttempt.drillId, 8).catch(() => [])
        const fallback = attempts.find((candidate) => candidate.id !== currentAttempt.id) ?? null
        setBestAttempt(fallback)
      }
    })().catch((error) => captureException(error, { screen: 'Playback' }))
  }, [attemptId])

  const drillTitle = useMemo(() => {
    if (!attempt) return ''
    return pack.drills.find((drill) => drill.id === attempt.drillId)?.title ?? attempt.drillId
  }, [attempt, pack.drills])

  const audioUri = (attempt as any)?.metrics?.audioUri as string | undefined
  const pb = useSoundPlayback(audioUri)

  useEffect(() => {
    let lastChangedAt = routeBroker.getState().lastChangedAtMs
    return routeBroker.subscribe((snapshot) => {
      if (!snapshot.lastChangedAtMs || snapshot.lastChangedAtMs === lastChangedAt) return
      lastChangedAt = snapshot.lastChangedAtMs
      if (!pb.isPlaying) return
      pb.toggle().catch((error) => logger.warn('Playback toggle failed', error))
      setRouteAlert(true)
    })
  }, [pb])

  useEffect(() => {
    return onInterruption((event) => {
      if (event.type === 'app_state' && event.to !== 'active') pb.unload()
    })
  }, [pb])

  const wf = useWaveformData({ uri: audioUri ?? null, metrics: (attempt as any)?.metrics, bars: q.waveformBars })
  const playbackTrace = useMemo(() => toPlaybackTrace(((attempt as any)?.metrics as any)?.waveformPeaks), [attempt])
  const elapsedLabel = pb.progressLabel.split(' / ')[0] ?? '00:00'
  const totalLabel = pb.progressLabel.split(' / ')[1] ?? '00:00'

  if (!attempt) {
    return (
      <Screen background="gradient">
        <BrandWorldBackdrop />
        <Text preset="h1">{COPY.title}</Text>
        <Text preset="muted">{COPY.loading}</Text>
        <Button text={COPY.back} variant="ghost" onPress={() => navigation.goBack()} />
      </Screen>
    )
  }

  const dateLabel = formatDate(attempt.createdAt, { dateStyle: 'medium', timeStyle: 'short' })
  const canSeek = !!audioUri && pb.isReady
  const compareDelta = bestAttempt ? Math.round(attempt.score - bestAttempt.score) : null
  const currentMetrics = toCompareMetrics(attempt)
  const comparisonMetrics = bestAttempt ? toCompareMetrics(bestAttempt) : null

  const saveBest = async () => {
    await setBestTakeForAttempt({
      sessionId: attempt.sessionId,
      drillId: attempt.drillId,
      attemptId: attempt.id,
      score: attempt.score,
    })
    setIsBest(true)
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 1400)
  }

  return (
    <Screen scroll background="gradient">
      <BrandWorldBackdrop />
      {routeAlert ? (
        <Card tone="warning">
          <Text preset="h3">{COPY.routeTitle}</Text>
          <Text preset="muted">{COPY.routeBody}</Text>
          <Stack direction="horizontal" gap={8}>
            <Button
              text={COPY.resume}
              onPress={() => {
                setRouteAlert(false)
                pb.toggle().catch((error) => logger.warn('Playback toggle failed', error))
              }}
            />
            <Button text={COPY.chooseOutput} variant="ghost" onPress={() => navigation.navigate('MainTabs' as any, { screen: 'Settings' } as any)} />
          </Stack>
        </Card>
      ) : null}

      <Card tone="glow" style={{ overflow: 'hidden' }}>
        <LinearGradient colors={['rgba(102,60,225,0.42)', 'rgba(24,14,58,0.88)']} style={ABS_FILL} />
        <Stack direction="horizontal" justify="space-between" align="center">
          <Stack gap={2} style={{ flex: 1 }}>
            <Text preset="h1">{COPY.title}</Text>
            <Text preset="h2">{drillTitle}</Text>
            <Text preset="muted">{`Take · ${dateLabel}`}</Text>
          </Stack>
          {isBest ? <TakeBadge status="best" /> : null}
        </Stack>
        <Box style={{ height: 8 }} />
        <Text preset="muted">{t('guidedFlow.playbackNowWhyNext')}</Text>
        <Box style={{ height: 8 }} />
        <Stack direction="horizontal" gap={8}>
          <Button text={COPY.back} variant="ghost" onPress={() => navigation.goBack()} />
          {bestAttempt ? <Button text={compareOn ? COPY.compareOff : COPY.compare} variant="ghost" onPress={() => setCompareOn((value) => !value)} /> : null}
        </Stack>
      </Card>

      <Card tone="elevated">
        <Box style={{ gap: 8 }}>
          <CurrentZoneChip label={isBest ? 'Best take active' : 'Current take'} />
          <PremiumRangePracticePanel
            likelyZone="Alto"
            progress={pb.progress}
            traceValues={playbackTrace}
            phraseChunks={['record', 'playback', 'save', 'next']}
            elapsedLabel={elapsedLabel}
            totalLabel={totalLabel}
            onScrub={canSeek ? pb.seekToProgress : undefined}
          />
        </Box>
      </Card>

      <Card tone="elevated" style={{ overflow: 'hidden' }}>
        <Stack direction="horizontal" justify="space-between" align="center">
          <Stack gap={2} style={{ flex: 1 }}>
            <Text preset="h3">{COPY.title}</Text>
            <Text preset="muted">{pb.progressLabel}</Text>
          </Stack>
        </Stack>

        <Box style={{ height: 10 }} />
        <WaveformPlayerModule
          testID="waveform-player"
          loading={wf.loading}
          peaks={wf.data?.waveformPeaks ?? []}
          progress={pb.progress}
          progressLabel={pb.progressLabel}
          isPlaying={pb.isPlaying}
          onSeek={canSeek ? pb.seekToProgress : undefined}
          onToggle={audioUri && pb.isReady ? pb.toggle : undefined}
          onRestart={audioUri && pb.isReady ? () => pb.seekToMs(0) : undefined}
        />

        <Box style={{ height: 8 }} />
        <Stack direction="horizontal" gap={8}>
          <Button text={COPY.saveBest} onPress={() => void saveBest()} />
          <Button text={COPY.share} variant="ghost" onPress={() => navigation.navigate('Results', { sessionId: attempt.sessionId })} />
        </Stack>
        {savedToast ? <Text preset="muted">{COPY.savedBest}</Text> : null}
      </Card>

      {compareOn && bestAttempt ? (
        <Card tone="elevated">
          <Box style={{ gap: 10 }}>
            <Text preset="h3">{COPY.bestMoment}</Text>
            <Stack direction="horizontal" gap={10}>
              <Card tone="default" style={{ flex: 1 }}>
                <Box style={{ gap: 4 }}>
                  <Text preset="body">{t('playback.currentTake') ?? 'Current take'}</Text>
                  <Text preset="h2">{Math.round(attempt.score)}</Text>
                  <Text preset="muted">{`Voiced ${currentMetrics.voiced}`}</Text>
                  <Text preset="muted">{`Stability ${currentMetrics.stability}`}</Text>
                  <Text preset="muted">{`Entry ${currentMetrics.entry}`}</Text>
                </Box>
              </Card>
              <Card tone="default" style={{ flex: 1 }}>
                <Box style={{ gap: 4 }}>
                  <Text preset="body">{t('playback.comparisonTake') ?? 'Comparison take'}</Text>
                  <Text preset="h2">{Math.round(bestAttempt.score)}</Text>
                  <Text preset="muted">{`Voiced ${comparisonMetrics?.voiced ?? '—'}`}</Text>
                  <Text preset="muted">{`Stability ${comparisonMetrics?.stability ?? '—'}`}</Text>
                  <Text preset="muted">{`Entry ${comparisonMetrics?.entry ?? '—'}`}</Text>
                </Box>
              </Card>
            </Stack>
            <Text preset="muted">{`Score delta: ${compareDelta != null ? `${compareDelta >= 0 ? '+' : ''}${compareDelta}` : '—'}`}</Text>
          </Box>
        </Card>
      ) : null}

      <NextActionBar
        title={COPY.nextTitle}
        subtitle={COPY.nextSubtitle}
        primaryLabel={COPY.next}
        onPrimary={() => navigation.navigate('MainTabs' as any, { screen: 'Session' } as any)}
        secondaryLabel={COPY.results}
        onSecondary={() => navigation.navigate('Results', { sessionId: attempt.sessionId })}
      />
    </Screen>
  )
}

function toPlaybackTrace(peaks: number[] | undefined) {
  if (Array.isArray(peaks) && peaks.length > 6) return peaks.slice(-96).map((value) => Math.max(0, Math.min(1, value / 100)))
  return [0.45, 0.5, 0.54, 0.5, 0.48, 0.52]
}

function toCompareMetrics(attempt: Attempt): { voiced: string; stability: string; entry: string } {
  const metrics: any = attempt.metrics ?? {}
  const voiced = typeof metrics.voicedRatio === 'number' ? `${Math.round(metrics.voicedRatio * 100)}%` : '—'
  const stability = typeof metrics.wobbleCents === 'number' ? `${Math.round(metrics.wobbleCents)}c` : '—'
  const entry = typeof metrics.timeToEnterMs === 'number' ? `${Math.round(metrics.timeToEnterMs)}ms` : '—'
  return { voiced, stability, entry }
}

const ABS_FILL = { position: 'absolute' as const, top: 0, right: 0, bottom: 0, left: 0 }
