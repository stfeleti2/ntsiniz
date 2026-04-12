import React, { useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Box } from '@/ui'
import { Button } from '@/ui/components/kit'
import { Card } from '@/ui/components/kit'
import { SurfacePressable } from '@/ui/primitives'
import { BrandWorldBackdrop } from '@/ui/guidedJourney'

import { getSettings, upsertSettings } from '@/core/storage/settingsRepo'
import { profileForSingingLevel, type SingingLevel } from '@/core/guidedJourney/singingLevel'
import { getVoiceIdentity, upsertVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'
import { t } from '@/app/i18n'
import { useTheme } from '@/theme/provider'

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
  const theme = useTheme()
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
        <LinearGradient colors={['rgba(98,56,227,0.48)', 'rgba(29,16,73,0.84)']} style={ABS_FILL} />
        <Box style={{ gap: 8 }}>
          <Text preset="h1">{copy.title}</Text>
          <Text preset="muted">{copy.subtitle}</Text>
        </Box>
      </Card>

      <Box style={{ gap: 10 }}>
        {LEVEL_OPTIONS.map((option) => {
          const selected = option.id === level
          return (
            <SurfacePressable
              key={option.id}
              onPress={() => setLevel(option.id)}
              accessibilityRole="button"
              accessibilityLabel={option.title}
              elevation={selected ? 'glass' : 'raised'}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: theme.spacing[3],
                paddingVertical: theme.spacing[3],
                backgroundColor: selected ? 'rgba(138,116,238,0.22)' : theme.colors.surfaceGlass,
                borderColor: selected ? theme.colors.borderStrong : theme.colors.border,
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  borderWidth: 1,
                  borderColor: selected ? theme.colors.borderStrong : 'rgba(255,255,255,0.24)',
                  backgroundColor: selected ? 'rgba(164,139,255,0.46)' : 'rgba(255,255,255,0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                  <Text preset="body">{option.icon}</Text>
                </View>
                <Box style={{ flex: 1, gap: 4 }}>
                  <Text preset="h3">{option.title}</Text>
                  <Text preset="muted">{option.description}</Text>
                </Box>
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: selected ? 'rgba(176,255,233,0.9)' : 'rgba(255,255,255,0.46)',
                    backgroundColor: selected ? 'rgba(122,248,226,0.78)' : 'transparent',
                  }}
                />
            </SurfacePressable>
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

const ABS_FILL = { position: 'absolute' as const, top: 0, right: 0, bottom: 0, left: 0 }
