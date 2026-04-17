import React from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Linking, Platform, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Box } from '@/ui'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Card } from '@/ui/components/kit'
import { BrandWorldBackdrop, StatusPill } from '@/ui/guidedJourney'
import { t } from '@/app/i18n'

type Props = NativeStackScreenProps<RootStackParamList, 'Recovery'>

const RECOVERY_COPY: Record<
  Props['route']['params']['reason'],
  {
    title: string
    status: string
    explanation: string
    suggestions: string[]
    action: string
    state: 'blocked' | 'noisy' | 'retry' | 'listening'
  }
> = {
  micDenied: {
    title: 'Microphone access is needed to sing live.',
    status: 'Permission',
    explanation: 'You can keep exploring, but scoring and pitch feedback need microphone input.',
    suggestions: ['Retry permission when ready.'],
    action: 'Try again',
    state: 'retry',
  },
  micBlocked: {
    title: 'Microphone is blocked in system settings.',
    status: 'Settings',
    explanation: 'Enable microphone access in Settings, then come back to continue.',
    suggestions: ['Open Settings and allow microphone.'],
    action: 'Open settings',
    state: 'blocked',
  },
  noisyRoom: {
    title: 'The room is too noisy for fair scoring.',
    status: 'Signal',
    explanation: 'Background noise is masking your voice and can make scoring feel unfair.',
    suggestions: ['Try a quieter corner.', 'Face the phone microphone directly.'],
    action: 'Retry',
    state: 'noisy',
  },
  noVoice: {
    title: 'We did not detect a steady voice signal.',
    status: 'Input',
    explanation: 'The app needs at least a short clear vocal sound to evaluate fairly.',
    suggestions: ['Sing an easy “ahh” for one full second.'],
    action: 'Retry',
    state: 'retry',
  },
  tooQuiet: {
    title: 'Input is too quiet.',
    status: 'Input',
    explanation: 'Your signal is present, but too soft for reliable pitch tracking.',
    suggestions: ['Move a little closer to your mic.', 'Use a natural speaking-level tone.'],
    action: 'Retry',
    state: 'retry',
  },
  tooLoud: {
    title: 'Input is clipping.',
    status: 'Input',
    explanation: 'Very loud input can flatten detail and hurt fairness.',
    suggestions: ['Reduce volume slightly.', 'Hold the phone a little farther away.'],
    action: 'Retry',
    state: 'retry',
  },
  clipping: {
    title: 'Signal clipping detected.',
    status: 'Signal',
    explanation: 'We paused because clipped input can bias scoring.',
    suggestions: ['Back off volume slightly.', 'Avoid shouting at close range.'],
    action: 'Retry',
    state: 'retry',
  },
  silenceDetected: {
    title: 'We are mostly hearing silence.',
    status: 'Signal',
    explanation: 'No continuous vocal segment was found long enough for scoring.',
    suggestions: ['Sing one short sustained sound.', 'Check microphone access.'],
    action: 'Retry',
    state: 'listening',
  },
  permissionLost: {
    title: 'Microphone permission changed mid-session.',
    status: 'Permission',
    explanation: 'Access dropped while listening, so we paused to protect reliability.',
    suggestions: ['Re-enable microphone permission.', 'Retry when permission is restored.'],
    action: 'Retry',
    state: 'retry',
  },
  routeChanged: {
    title: 'Audio route changed.',
    status: 'Route',
    explanation: 'Your input source changed, so capture was paused for consistency.',
    suggestions: ['Reconnect your preferred mic.', 'Retry after route settles.'],
    action: 'Retry',
    state: 'retry',
  },
  audioSetup: {
    title: 'Audio setup needs a quick reset.',
    status: 'Setup',
    explanation: 'The session did not get a stable capture path.',
    suggestions: ['Retry now.', 'Use Settings if it keeps happening.'],
    action: 'Retry',
    state: 'retry',
  },
  retune: {
    title: 'A quick retune will help.',
    status: 'Tuning',
    explanation: 'A short retune can clean up noisy or unstable capture conditions.',
    suggestions: ['Run the quick retune flow once.'],
    action: 'Open retune',
    state: 'listening',
  },
}

export function RecoveryScreen({ navigation, route }: Props) {
  const reason = route.params.reason
  const copy = RECOVERY_COPY[reason]
  const screenTitle = 'Let us get you back in'
  const backLabel = 'Back'

  const onPrimary = async () => {
    if (reason === 'micBlocked') {
      try {
        if (Platform.OS === 'ios') await Linking.openURL('app-settings:')
        else await Linking.openSettings()
      } catch {
        // no-op
      }
      return
    }

    if (reason === 'retune') {
      navigation.replace('Calibration')
      return
    }

    if (route.params.next?.name) {
      navigation.replace(route.params.next.name as any, route.params.next.params)
      return
    }
    navigation.goBack()
  }

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <Box style={{ gap: 12 }}>
        <Text preset="h1">{screenTitle}</Text>
        <StatusPill state={copy.state} label={copy.status} />
      </Box>

      <Card tone="warning" style={{ overflow: 'hidden' }}>
        <LinearGradient colors={['rgba(120,74,24,0.35)', 'rgba(35,22,13,0.75)']} style={StyleSheet.absoluteFill} />
        <Box style={{ gap: 10 }}>
          <Text preset="h2">{copy.title}</Text>
          <Text preset="muted">{copy.explanation}</Text>
          <Text preset="muted">{t('guidedFlow.recoveryNowWhyNext')}</Text>
          {copy.suggestions.slice(0, 2).map((suggestion, suggestionIndex) => (
            <Text key={`suggestion-${suggestionIndex}`} preset="muted">
              {`\u2022 ${suggestion}`}
            </Text>
          ))}
        </Box>
      </Card>

      <Card tone="elevated">
        <Box style={{ gap: 10 }}>
          <Button text={copy.action} onPress={() => void onPrimary()} />
          <Button text={backLabel} variant="ghost" onPress={() => navigation.goBack()} />
        </Box>
      </Card>
    </Screen>
  )
}
