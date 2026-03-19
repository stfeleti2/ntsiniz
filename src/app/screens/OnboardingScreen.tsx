import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Box } from '@/ui'
import { getSettings, upsertSettings } from '@/core/storage/settingsRepo'
import { BrandWorldBackdrop, ChoiceCardGroup, HexagonStateRenderer, PrimaryActionBar } from '@/ui/guidedJourney'
import type { CoachingMode, OnboardingIntent } from '@/core/guidedJourney'

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>

export function OnboardingScreen({ navigation }: Props) {
  const [intent, setIntent] = useState<OnboardingIntent | null>(null)
  const [mode, setMode] = useState<CoachingMode | null>(null)
  const copy = {
    title: 'Shape the guide around you',
    subtitle: 'Choose why you are here and how much coaching you want in the moment.',
    heroTitle: 'Goal + guidance',
    heroBody: 'One clear choice now makes every later hint feel more personal.',
    intentTitle: 'Why are you singing today?',
    modeTitle: 'How should the coach feel?',
  }

  useEffect(() => {
    ;(async () => {
      const s = await getSettings()
      setIntent((s.onboardingIntent as OnboardingIntent | undefined) ?? 'justExplore')
      setMode((s.coachingMode as CoachingMode | undefined) ?? 'starter')
    })().catch(() => {})
  }, [])

  const next = async () => {
    if (!intent || !mode) return
    const s = await getSettings()
    const routeHint =
      intent === 'justStarting'
        ? 'R1'
        : intent === 'singInTune'
          ? 'R2'
          : intent === 'justExplore'
            ? 'R3'
            : mode === 'performerCoach'
              ? 'R5'
              : 'R4'
    await upsertSettings({
      ...s,
      onboardingIntent: intent,
      coachingMode: mode,
      routeHint,
    })
    navigation.navigate('PermissionsPrimer', { kind: 'mic', next: { name: 'WakeYourVoice' } })
  }

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <Box style={{ gap: 16 }}>
        <Text preset="h1">{copy.title}</Text>
        <Text preset="muted">{copy.subtitle}</Text>

        <HexagonStateRenderer state="ready" title={copy.heroTitle} subtitle={copy.heroBody} />

        <ChoiceCardGroup
          title={copy.intentTitle}
          value={intent}
          onChange={setIntent}
          options={[
            { id: 'justStarting', title: 'I’m just starting', subtitle: 'Gentle first wins and low-pressure reps.' },
            { id: 'singInTune', title: 'I want to sing in tune', subtitle: 'More pitch-entry and control cues.' },
            { id: 'moreControl', title: 'I want more control', subtitle: 'Steadier holds, cleaner slides, better landings.' },
            { id: 'songsBetter', title: 'I want to sing songs better', subtitle: 'Phrase shape, melody, and musical carry-over.' },
            { id: 'choirWorship', title: 'Choir / worship', subtitle: 'Blend, reliability, and confident entrances.' },
            { id: 'justExplore', title: 'Just explore', subtitle: 'A flexible route that stays supportive.' },
          ]}
        />

        <ChoiceCardGroup
          title={copy.modeTitle}
          value={mode}
          onChange={setMode}
          options={[
            { id: 'starter', title: 'Starter', subtitle: 'Clear, gentle, beginner-friendly coaching.' },
            { id: 'casual', title: 'Casual', subtitle: 'Light guidance without too much interruption.' },
            { id: 'practised', title: 'Practised', subtitle: 'Sharper cues and quicker pacing.' },
            { id: 'performerCoach', title: 'Performer / coach', subtitle: 'Dense feedback and tighter expectations.' },
          ]}
        />

        <PrimaryActionBar
          primaryLabel="Continue to voice check"
          onPrimary={() => void next()}
          secondaryLabel="Back"
          onSecondary={() => navigation.goBack()}
          helperText="You can change both later. Right now we only need a useful starting direction."
        />
      </Box>
    </Screen>
  )
}
