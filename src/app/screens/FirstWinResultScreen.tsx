import React, { useEffect, useMemo, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Box } from '@/ui'
import { Input } from '@/ui/components/kit/Input'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import type { RootStackParamList } from '../navigation/types'
import { BrandWorldBackdrop, ChapterHeroCard, NextStepCard, StartingProfileCard, VoiceSnapshotCard } from '@/ui/guidedJourney'
import { getVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'
import { ensureSelfPerson, updateSelfProfile } from '@/core/social/peopleRepo'
import { getJourneyV3Progress } from '@/core/guidedJourney/progress'
import { loadGuidedJourneyProgram } from '@/core/guidedJourney/loader'
import { track } from '@/app/telemetry'

type Props = NativeStackScreenProps<RootStackParamList, 'FirstWinResult'>

export function FirstWinResultScreen({ navigation }: Props) {
  const [voiceIdentity, setVoiceIdentity] = useState<Awaited<ReturnType<typeof getVoiceIdentity>> | null>(null)
  const [name, setName] = useState('')
  const [lessonId, setLessonId] = useState<string | null>(null)
  const copy = {
    title: 'First win',
    loading: 'Loading your starting chapter…',
    successTitle: 'You woke the voice.',
    successBody: 'That was a real win, not a cold diagnosis. We have enough to start your guided chapter.',
    strongestTitle: 'Your strongest moment',
    comfortTitle: 'Comfort zone snapshot',
    nameLabel: 'What should we call you?',
    namePlaceholder: 'Optional',
    nextTitle: 'Start Lesson 1',
  }

  useEffect(() => {
    ;(async () => {
      const identity = await getVoiceIdentity()
      setVoiceIdentity(identity)
      const me = await ensureSelfPerson().catch(() => null)
      setName(me?.displayName === 'You' ? '' : me?.displayName ?? '')
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
        <BrandWorldBackdrop />
        <Text preset="h1">{copy.title}</Text>
        <Text preset="muted">{copy.loading}</Text>
      </Screen>
    )
  }

  const snapshot = voiceIdentity.firstWinSnapshot
  const likelyFamily = voiceIdentity.likelyFamily.confidence >= 0.72 ? voiceIdentity.likelyFamily.label : null

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <Box style={{ gap: 16 }}>
        <Text preset="h1">{copy.successTitle}</Text>
        <Text preset="muted">{copy.successBody}</Text>

        <StartingProfileCard
          title={copy.strongestTitle}
          body={`You held a calm note for ${Math.round(snapshot.sustainDurationMs / 100) / 10}s and gave the engine a trustworthy signal.`}
          items={[
            snapshot.glideSuccess >= 0.55 ? 'Your voice follows upward motion well.' : 'Your safest win is settling one note at a time.',
            snapshot.loudnessComfort === 'comfortable' ? 'Your natural volume is already in a good place.' : 'Comfortable volume will help your next reps lock faster.',
          ]}
        />

        <VoiceSnapshotCard
          title={copy.comfortTitle}
          body="This is only a soft starting picture. It gets smarter as you sing."
          items={[
            snapshot.roughComfortablePitchBand.lowMidi != null && snapshot.roughComfortablePitchBand.highMidi != null
              ? `Comfort band: ${snapshot.roughComfortablePitchBand.lowMidi} to ${snapshot.roughComfortablePitchBand.highMidi} midi`
              : 'Comfort band is still warming up.',
            `Route fit: ${snapshot.placement.routeId} at ${Math.round(snapshot.placement.confidence * 100)}% confidence`,
            likelyFamily ? likelyFamily : 'We will wait before suggesting a vocal family label.',
          ]}
        />

        <ChapterHeroCard
          title={snapshot.placement.recommendedLessonTitle ?? 'Your starting lesson'}
          subtitle={`We are starting you in ${stageTitle} so every screen keeps moving you forward.`}
          stageLabel={stageTitle}
        />

        <Input label={copy.nameLabel} value={name} onChangeText={setName} placeholder={copy.namePlaceholder} />

        <NextStepCard
          title={copy.nextTitle}
          body="We will drop you into your current chapter with the right lesson and the real drill runner."
          cta="Start lesson"
          onPress={async () => {
            if (name.trim()) await updateSelfProfile({ displayName: name.trim() }).catch(() => {})
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
          }}
        />

        <Button text="Retry voice check" variant="ghost" onPress={() => navigation.replace('WakeYourVoice')} />
      </Box>
    </Screen>
  )
}
