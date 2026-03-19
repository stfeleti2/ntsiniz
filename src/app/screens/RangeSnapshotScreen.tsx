import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Box } from '@/ui'
import { Button } from '@/ui/components/Button'
import { getVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'
import { BrandWorldBackdrop, MilestoneCard, VoiceSnapshotCard } from '@/ui/guidedJourney'

type Props = NativeStackScreenProps<RootStackParamList, 'RangeSnapshot'>

const copy = {
  title: 'Range snapshot',
  subtitle: 'Soft confident bounds, not a hard label or final verdict.',
  loading: 'Loading your comfort zone…',
  waiting: 'We still need a little more singing before your bounds become useful.',
  comfortTitle: 'Comfort zone',
  lowBound: 'Low bound',
  highBound: 'High bound',
  span: 'Span',
  back: 'Back to profile',
}

export function RangeSnapshotScreen({ navigation }: Props) {
  const [voice, setVoice] = useState<Awaited<ReturnType<typeof getVoiceIdentity>> | null>(null)

  useEffect(() => {
    getVoiceIdentity().then(setVoice).catch(() => setVoice(null))
  }, [])

  if (!voice) {
    return (
      <Screen background="hero">
        <BrandWorldBackdrop />
        <Text preset="h1">{copy.title}</Text>
        <Text preset="muted">{copy.loading}</Text>
      </Screen>
    )
  }

  const low = voice.comfortZone.lowMidi
  const high = voice.comfortZone.highMidi
  const hasBand = low != null && high != null
  const confidence = Math.round((voice.firstWinSnapshot?.placement.confidence ?? 0.58) * 100)

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{copy.title}</Text>
        <Text preset="muted">{copy.subtitle}</Text>
      </Box>

      <VoiceSnapshotCard
        title={copy.comfortTitle}
        body={hasBand ? `Current soft band: ${low} to ${high} midi.` : copy.waiting}
        items={[
          `Confidence: ${confidence}%`,
          `Placement route: ${voice.firstWinSnapshot?.placement.routeId ?? 'R4'}`,
          voice.firstWinSnapshot?.placement.recalibrationNeeded ? 'A recalibration may help clean up noisy conditions.' : 'The current room read looked stable enough to trust.',
        ]}
      />

      <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <MilestoneCard title={copy.lowBound} body="Soft current lower edge." stat={low == null ? '—' : String(low)} />
        <MilestoneCard title={copy.highBound} body="Soft current upper edge." stat={high == null ? '—' : String(high)} />
        <MilestoneCard title={copy.span} body="Comfort span in midi steps." stat={hasBand ? String(high - low) : '—'} />
      </Box>

      <Button text={copy.back} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
