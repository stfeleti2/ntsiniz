import React, { useEffect, useMemo, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { Box } from '@/ui'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import type { RootStackParamList } from '../navigation/types'
import { Card } from '@/ui/components/kit'
import { getVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'
import { getJourneyV3Progress } from '@/core/guidedJourney/progress'
import { loadGuidedJourneyProgram } from '@/core/guidedJourney/loader'
import { track } from '@/app/telemetry'
import { BrandWorldBackdrop } from '@/ui/guidedJourney'
import { LinearGradient } from 'expo-linear-gradient'
import { StyleSheet } from 'react-native'
import { t } from '@/app/i18n'
import { formatNumber } from '@/core/i18n/intl'

type Props = NativeStackScreenProps<RootStackParamList, 'FirstWinResult'>

export function FirstWinResultScreen({ navigation }: Props) {
  const [voiceIdentity, setVoiceIdentity] = useState<Awaited<ReturnType<typeof getVoiceIdentity>> | null>(null)
  const [lessonId, setLessonId] = useState<string | null>(null)

  const copy = {
    title: 'First win captured',
    subtitle: 'You gave us a real signal. Here is your starting chapter.',
    loading: 'Building your starting chapter…',
    cardOverall: 'Overall performance',
    cardRange: 'Likely range zone',
    cardInsight: 'Encouraging insight',
    cardTip: 'Practical tip',
    cardNext: 'Recommended starting chapter',
    start: 'Start first session',
    retry: 'Retry voice check',
  }

  useEffect(() => {
    ;(async () => {
      const identity = await getVoiceIdentity()
      setVoiceIdentity(identity)
      const journey = await getJourneyV3Progress()
      setLessonId(journey.lessonId ?? null)
      track('first_win_completed', { routeId: identity.firstWinSnapshot?.placement.routeId ?? 'R4' } as any)
    })().catch(() => {})
  }, [])

  const stageTitle = useMemo(() => {
    if (!voiceIdentity?.firstWinSnapshot?.placement.stageId) return 'Foundation'
    const program = loadGuidedJourneyProgram()
    return program.stagesById[voiceIdentity.firstWinSnapshot.placement.stageId]?.title ?? 'Foundation'
  }, [voiceIdentity])

  if (!voiceIdentity?.firstWinSnapshot) {
    return (
      <Screen background="hero">
        <Text preset="h1">{copy.title}</Text>
        <Text preset="muted">{copy.loading}</Text>
      </Screen>
    )
  }

  const snapshot = voiceIdentity.firstWinSnapshot
  const confidence = Math.round((snapshot.placement.confidence ?? 0.6) * 100)
  const rangeLow = snapshot.roughComfortablePitchBand.lowMidi
  const rangeHigh = snapshot.roughComfortablePitchBand.highMidi
  const rangeLine = rangeLow != null && rangeHigh != null ? `${rangeLow} to ${rangeHigh} midi` : 'Range is still warming up'
  const likelyLine = snapshot.placement.likelyFamily ? `Closest to ${snapshot.placement.likelyFamily}` : 'Closest zone is still calibrating'
  const overallLine =
    snapshot.firstDrillScore != null
      ? `First drill score: ${Math.round(snapshot.firstDrillScore)} (${snapshot.firstDrillBand?.replace(/_/g, ' ') ?? 'pass'}).`
      : snapshot.sustainDurationMs >= 1200
        ? `Steady hold: ${Math.round(snapshot.sustainDurationMs / 100) / 10}s`
        : 'Great first signal captured'
  const insightLine =
    snapshot.glideSuccess >= 0.58
      ? 'Your pitch movement already follows direction well.'
      : 'You gave a clean baseline and that is exactly what matters first.'
  const tipLine =
    snapshot.loudnessComfort === 'quiet'
      ? 'Move a little closer to the mic next time for clearer lock.'
      : snapshot.loudnessComfort === 'strong'
        ? 'Use slightly less volume for cleaner tracking.'
        : 'Keep using comfortable volume and short steady holds.'
  const trustLine =
    typeof snapshot.snrDb === 'number'
      ? `Signal quality: ${formatNumber(snapshot.snrDb, { maximumFractionDigits: 1, minimumFractionDigits: 1 })} dB SNR · Route stability ${Math.round((snapshot.routeStabilityScore ?? 0.8) * 100)}%.`
      : 'Signal quality checks passed for fair scoring.'

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <Box style={{ gap: 8 }}>
        <Text preset="h1">{copy.title}</Text>
        <Text preset="muted">{copy.subtitle}</Text>
      </Box>

      <Card tone="glow" style={{ overflow: 'hidden' }}>
        <LinearGradient colors={['rgba(104,61,228,0.42)', 'rgba(23,15,58,0.9)']} style={StyleSheet.absoluteFill} />
        <Box style={{ gap: 8 }}>
          <Text preset="h3">{copy.cardOverall}</Text>
          <Text preset="body">{overallLine}</Text>
          <Text preset="muted">{`Placement confidence: ${confidence}%`}</Text>
        </Box>
      </Card>

      <Card tone="elevated">
        <Box style={{ gap: 8 }}>
          <Text preset="h3">{copy.cardRange}</Text>
          <Text preset="body">{likelyLine}</Text>
          <Text preset="muted">{rangeLine}</Text>
        </Box>
      </Card>

      <Card tone="elevated">
        <Box style={{ gap: 8 }}>
          <Text preset="h3">{copy.cardInsight}</Text>
          <Text preset="body">{insightLine}</Text>
          <Text preset="muted">{trustLine}</Text>
        </Box>
      </Card>

      <Card tone="glow">
        <Box style={{ gap: 8 }}>
          <Text preset="h3">{copy.cardNext}</Text>
          <Text preset="body">{snapshot.placement.recommendedLessonTitle ?? 'Your starting lesson'}</Text>
          <Text preset="muted">{`Stage: ${stageTitle}`}</Text>
          <Text preset="muted">{tipLine}</Text>
          <Text preset="muted">{t('guidedFlow.firstWinNowWhyNext')}</Text>
        </Box>
      </Card>

      <Button
        text={copy.start}
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'MainTabs' as any,
                params: {
                  screen: 'Session',
                  params: {
                    lessonId: lessonId ?? snapshot.placement.lessonId,
                    stageId: snapshot.placement.stageId,
                  },
                },
              } as any,
            ],
          })
        }
      />
      <Button text={copy.retry} variant="ghost" onPress={() => navigation.replace('WakeYourVoice')} />
    </Screen>
  )
}
