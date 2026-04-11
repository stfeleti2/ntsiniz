import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Box } from '@/ui'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { BrandWorldBackdrop, CurrentZoneChip } from '@/ui/guidedJourney'
import { PremiumRangePracticePanel } from '@/ui/onboarding/PremiumRangePracticePanel'
import { likelyZoneFromBand } from '@/ui/onboarding/rangeLadder'
import { getVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'
import { listRecentAttempts, type Attempt } from '@/core/storage/attemptsRepo'
import { useSoundPlayback } from '@/app/audio/useSoundPlayback'
import { t } from '@/app/i18n'

type Props = NativeStackScreenProps<RootStackParamList, 'RangeSnapshot'>

const COPY = {
  title: 'Range snapshot',
  subtitle: 'Closest zone and comfort span, updated from real singing.',
  loading: 'Loading your range snapshot…',
  controls: 'Reference playback',
  noRecentTake: 'No recent take yet',
  back: 'Back to profile',
  play: 'Play',
  pause: 'Pause',
}

export function RangeSnapshotScreen({ navigation }: Props) {
  const [voice, setVoice] = useState<Awaited<ReturnType<typeof getVoiceIdentity>> | null>(null)
  const [latestAttempt, setLatestAttempt] = useState<Attempt | null>(null)

  useEffect(() => {
    ;(async () => {
      const [voiceIdentity, attempts] = await Promise.all([getVoiceIdentity(), listRecentAttempts(12)])
      setVoice(voiceIdentity)
      setLatestAttempt(attempts.find((attempt) => Boolean((attempt.metrics as any)?.audioUri)) ?? null)
    })().catch(() => {
      setVoice(null)
      setLatestAttempt(null)
    })
  }, [])

  const audioUri = (latestAttempt?.metrics as any)?.audioUri as string | undefined
  const pb = useSoundPlayback(audioUri)

  const band = useMemo(
    () => ({
      low: voice?.comfortZone.lowMidi ?? null,
      high: voice?.comfortZone.highMidi ?? null,
    }),
    [voice?.comfortZone.highMidi, voice?.comfortZone.lowMidi],
  )
  const likelyZone = useMemo(() => likelyZoneFromBand(band), [band])
  const traceValues = useMemo(() => toTrace(latestAttempt, band), [band, latestAttempt])
  const comfortSpan = band.low != null && band.high != null ? `${band.low}–${band.high} midi` : 'Still warming up'
  const phraseChunks = useMemo(() => ['ah', 'ah', 'aa', 'ah'], [])

  if (!voice) {
    return (
      <Screen background="hero">
        <BrandWorldBackdrop />
        <Text preset="h1">{COPY.title}</Text>
        <Text preset="muted">{COPY.loading}</Text>
      </Screen>
    )
  }

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{COPY.title}</Text>
        <Text preset="muted">{COPY.subtitle}</Text>
      </Box>

      <Card tone="glow" style={{ overflow: 'hidden' }}>
        <LinearGradient colors={['rgba(103,60,226,0.44)', 'rgba(21,14,58,0.9)']} style={StyleSheet.absoluteFill} />
        <Box style={{ gap: 8 }}>
          <CurrentZoneChip label={`Closest to ${likelyZone}`} />
          <Text preset="h1">{likelyZone}</Text>
          <Text preset="muted">{`Comfort span: ${comfortSpan}`}</Text>
          <Text preset="muted">{t('guidedFlow.rangeSnapshotNowWhyNext')}</Text>
        </Box>
      </Card>

      <PremiumRangePracticePanel
        likelyZone={likelyZone}
        progress={pb.progress}
        traceValues={traceValues}
        phraseChunks={phraseChunks}
        elapsedLabel={pb.progressLabel.split(' / ')[0] ?? '00:00'}
        totalLabel={pb.progressLabel.split(' / ')[1] ?? '00:00'}
        onScrub={(next) => {
          if (!audioUri || !pb.isReady) return
          pb.seekToProgress(next).catch(() => {})
        }}
      />

      <BlurView intensity={54} tint="dark" style={styles.controlsCard}>
        <Box style={{ gap: 8 }}>
          <Text preset="h3">{COPY.controls}</Text>
          <Text preset="muted">{latestAttempt ? pb.progressLabel : COPY.noRecentTake}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button text={pb.isPlaying ? COPY.pause : COPY.play} onPress={() => pb.toggle().catch(() => {})} disabled={!audioUri || !pb.isReady} />
            <Button text={COPY.back} variant="ghost" onPress={() => navigation.goBack()} />
          </View>
        </Box>
      </BlurView>
    </Screen>
  )
}

function toTrace(attempt: Attempt | null, band: { low: number | null; high: number | null }) {
  const peaks = ((attempt?.metrics as any)?.waveformPeaks as number[] | undefined) ?? []
  if (peaks.length >= 6) return peaks.slice(-96).map((value) => clamp01(value / 100))
  if (band.low != null && band.high != null) {
    const center = (band.low + band.high) / 2
    const arc = Math.max(0.06, Math.min(0.22, (band.high - band.low) / 28))
    return new Array(42).fill(0).map((_, index) => clamp01(0.5 + Math.sin((index / 41) * Math.PI) * arc + (center - 58) * 0.01))
  }
  return [0.48, 0.5, 0.52, 0.49, 0.51, 0.53]
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

const styles = StyleSheet.create({
  controlsCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(190,175,255,0.3)',
    overflow: 'hidden',
    padding: 14,
  },
})
