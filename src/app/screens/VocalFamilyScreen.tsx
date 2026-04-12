import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Box } from '@/ui'
import { getVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'
import { BrandWorldBackdrop, StartingProfileCard, VoiceSnapshotCard } from '@/ui/guidedJourney'

type Props = NativeStackScreenProps<RootStackParamList, 'VocalFamily'>

const copy = {
  title: 'Vocal family',
  subtitle: 'Only soft identity language, and only when the confidence is strong enough.',
  loading: 'Loading your soft family estimate…',
  waitingTitle: 'Still warming up',
  waitingBody: 'We do not have enough confidence yet to suggest a likely family. We will keep showing comfort zone and focus instead.',
  confidentTitle: 'Likely family',
  confidentBody: 'This is a soft current picture. It can move as your data gets richer.',
}

export function VocalFamilyScreen({ navigation }: Props) {
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

  const confident = voice.likelyFamily.confidence >= 0.72 && !!voice.likelyFamily.label

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{copy.title}</Text>
        <Text preset="muted">{copy.subtitle}</Text>
      </Box>

      {confident ? (
        <StartingProfileCard
          title={copy.confidentTitle}
          body={copy.confidentBody}
          items={[
            voice.likelyFamily.label ?? '—',
            `Confidence: ${Math.round(voice.likelyFamily.confidence * 100)}%`,
            'We keep this soft because your voice can present differently as technique settles.',
          ]}
        />
      ) : (
        <VoiceSnapshotCard
          title={copy.waitingTitle}
          body={copy.waitingBody}
          items={[
            `Current confidence: ${Math.round(voice.likelyFamily.confidence * 100)}%`,
            voice.currentFocus[0] ?? 'We are still building more reps first.',
          ]}
        />
      )}

      <Button text="Back to profile" variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
