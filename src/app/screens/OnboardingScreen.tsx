import React, { useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Box } from '@/ui'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { BrandWorldBackdrop } from '@/ui/guidedJourney'

import { getSettings, upsertSettings } from '@/core/storage/settingsRepo'
import { profileForSingingLevel, type SingingLevel } from '@/core/guidedJourney/singingLevel'
import { getVoiceIdentity, upsertVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'
import { t } from '@/app/i18n'

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>

type LevelOption = {
  id: SingingLevel
  icon: string
  title: string
  description: string
}

const LEVEL_OPTIONS: LevelOption[] = [
  {
    id: 'justStarting',
    icon: '◌',
    title: 'Just starting',
    description: 'My voice and I are still getting to know each other.',
  },
  {
    id: 'casual',
    icon: '◔',
    title: 'Casual',
    description: 'I sing for fun, and sometimes I surprise myself.',
  },
  {
    id: 'serious',
    icon: '◉',
    title: 'Serious',
    description: 'I want real progress, not just vibes.',
  },
  {
    id: 'professionalCoach',
    icon: '⬢',
    title: 'Professional / Coach',
    description: 'I know what I am working on. Let us go.',
  },
]

export function OnboardingScreen({ navigation }: Props) {
  const [level, setLevel] = useState<SingingLevel>('justStarting')
  const [busy, setBusy] = useState(false)
  const copy = {
    title: 'Select your singing level',
    subtitle: 'This tunes helper density and explanation depth for your real first drill.',
    saving: 'Saving…',
    continue: 'Continue',
  }

  useEffect(() => {
    getSettings()
      .then((settings) => {
        setLevel(settings.singingLevel ?? 'justStarting')
      })
      .catch(() => {})
  }, [])

  const helperLine = useMemo(() => {
    const profile = profileForSingingLevel(level)
    if (profile.helperDensity === 'high') return 'You will get stronger step-by-step guidance.'
    if (profile.helperDensity === 'light') return 'You will get compact cues and faster flow.'
    return 'You will get balanced coaching with room to sing.'
  }, [level])

  const onContinue = async () => {
    setBusy(true)
    try {
      const current = await getSettings()
      const profile = profileForSingingLevel(level)
      await upsertSettings({
        ...current,
        singingLevel: level,
        helperDensity: profile.helperDensity,
        guideTone: profile.guideTone,
        coachingMode: profile.coachingMode,
        onboardingIntent: profile.onboardingIntent,
        routeHint: profile.routeHint,
      })
      const voiceIdentity = await getVoiceIdentity().catch(() => null)
      if (voiceIdentity) {
        await upsertVoiceIdentity({
          ...voiceIdentity,
          updatedAt: Date.now(),
          coachingMode: profile.coachingMode,
          onboardingIntent: profile.onboardingIntent,
        }).catch(() => {})
      }
      navigation.replace('PermissionsPrimer', { kind: 'mic', next: { name: 'WakeYourVoice' } })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <Card tone="glow" style={{ overflow: 'hidden' }}>
        <LinearGradient colors={['rgba(98,56,227,0.48)', 'rgba(29,16,73,0.84)']} style={StyleSheet.absoluteFill} />
        <Box style={{ gap: 8 }}>
          <Text preset="h1">{copy.title}</Text>
          <Text preset="muted">{copy.subtitle}</Text>
        </Box>
      </Card>

      <Box style={{ gap: 10 }}>
        {LEVEL_OPTIONS.map((option) => {
          const selected = option.id === level
          return (
            <Pressable key={option.id} onPress={() => setLevel(option.id)} accessibilityRole="button">
              <BlurView intensity={selected ? 44 : 30} tint="dark" style={[styles.optionCard, selected ? styles.optionCardSelected : null]}>
                <View style={[styles.iconPill, selected ? styles.iconPillSelected : null]}>
                  <Text preset="body">{option.icon}</Text>
                </View>
                <Box style={{ flex: 1, gap: 4 }}>
                  <Text preset="h3">{option.title}</Text>
                  <Text preset="muted">{option.description}</Text>
                </Box>
                <View style={[styles.selectDot, selected ? styles.selectDotSelected : null]} />
              </BlurView>
            </Pressable>
          )
        })}
      </Box>

      <Card tone="elevated">
        <Box style={{ gap: 6 }}>
          <Text preset="muted">{helperLine}</Text>
          <Text preset="muted">{t('guidedFlow.onboardingNowWhyNext')}</Text>
        </Box>
      </Card>

      <Button text={busy ? copy.saving : copy.continue} onPress={() => void onContinue()} disabled={busy} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  optionCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(194,186,244,0.34)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(29,24,54,0.58)',
    shadowColor: '#060410',
    shadowOpacity: 0.36,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  optionCardSelected: {
    borderColor: 'rgba(224,218,255,0.74)',
    backgroundColor: 'rgba(138,116,238,0.3)',
  },
  iconPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillSelected: {
    borderColor: 'rgba(228,220,255,0.9)',
    backgroundColor: 'rgba(164,139,255,0.46)',
  },
  selectDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.46)',
    backgroundColor: 'transparent',
  },
  selectDotSelected: {
    borderColor: 'rgba(176,255,233,0.9)',
    backgroundColor: 'rgba(122,248,226,0.78)',
  },
})
