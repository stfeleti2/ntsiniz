import React from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Linking, Platform } from 'react-native'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Box } from '@/ui'
import { Button } from '@/ui/components/Button'
import { BrandWorldBackdrop, HexagonStateRenderer, InlineRecoveryCard, StatusPill } from '@/ui/guidedJourney'

type Props = NativeStackScreenProps<RootStackParamList, 'Recovery'>

const recoveryCopy: Record<Props['route']['params']['reason'], { title: string; body: string; action: string }> = {
  micDenied: {
    title: 'We need the mic to hear your first win.',
    body: 'Ntsiniz only listens when you start a singing moment. Turn the mic on and we will pick up exactly where you left off.',
    action: 'Try again',
  },
  micBlocked: {
    title: 'The mic is blocked in system settings.',
    body: 'Open Settings, allow microphone access for Ntsiniz, then come back and we will continue.',
    action: 'Open Settings',
  },
  noisyRoom: {
    title: 'Your room is fighting the signal.',
    body: 'A quieter corner or a little less background sound will help the pitch engine trust what it hears.',
    action: 'Retry voice check',
  },
  noVoice: {
    title: 'We did not catch a clear voice yet.',
    body: 'Try a gentle “ahh” at speaking volume. You do not need to belt.',
    action: 'Retry',
  },
  tooQuiet: {
    title: 'Give us just a little more sound.',
    body: 'Stay comfortable and move a bit closer to the mic so the note can lock cleanly.',
    action: 'Retry',
  },
  tooLoud: {
    title: 'A softer voice will track better here.',
    body: 'Back off the volume a little and let the note stay easy instead of pushed.',
    action: 'Retry',
  },
  routeChanged: {
    title: 'Your audio route changed.',
    body: 'We paused so your setup stays trustworthy. Pick the route you want, then continue.',
    action: 'Retry',
  },
  audioSetup: {
    title: 'Your audio setup needs a quick reset.',
    body: 'We could not get a clean capture path. Try again or retune from Settings if this keeps happening.',
    action: 'Retry',
  },
  retune: {
    title: 'A quick retune will help.',
    body: 'We noticed enough room noise or level drift that a fresh audio setup is the safest next step.',
    action: 'Open retune',
  },
}

export function RecoveryScreen({ navigation, route }: Props) {
  const reason = route.params.reason
  const copy = recoveryCopy[reason]
  const uiCopy = {
    label: 'Recovery',
    title: 'Let’s get you back in.',
    subtitle: 'One calm fix, then we continue.',
    back: 'Back',
  }

  const handlePrimary = async () => {
    if (reason === 'micBlocked') {
      const url = Platform.OS === 'ios' ? 'app-settings:' : undefined
      try {
        if (url) await Linking.openURL(url)
        else await Linking.openSettings()
      } catch {
        // ignore
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
      <Box style={{ gap: 16 }}>
        <StatusPill state={reason === 'micBlocked' ? 'blocked' : reason === 'noisyRoom' ? 'noisy' : 'retry'} label={uiCopy.label} />
        <HexagonStateRenderer state={reason === 'micBlocked' ? 'paused' : 'needsRetry'} title={uiCopy.title} subtitle={uiCopy.subtitle} />
        <InlineRecoveryCard title={copy.title} body={copy.body} action={copy.action} onPress={handlePrimary} />
        <Button text={uiCopy.back} variant="ghost" onPress={() => navigation.goBack()} />
      </Box>
    </Screen>
  )
}
