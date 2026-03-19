import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Linking, Platform } from 'react-native'
import { Audio } from 'expo-av'
import { Camera } from 'expo-camera'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { getSettings, upsertSettings } from '@/core/storage/settingsRepo'
import { BrandWorldBackdrop, HexagonStateRenderer, PrimaryActionBar, TrustBulletRow } from '@/ui/guidedJourney'

type Kind = 'mic' | 'camera'

export function PermissionsPrimerScreen({ navigation, route }: any) {
  const kind: Kind = route?.params?.kind ?? 'mic'
  const next = route?.params?.next
  const [busy, setBusy] = useState(false)
  const [granted, setGranted] = useState(false)

  const copy = useMemo(() => {
    if (kind === 'camera') {
      return {
        title: 'Camera and voice check',
        body: 'We only ask for camera access in moments you deliberately start, like performance capture and social posting.',
        cta: 'Allow camera',
      }
    }
    return {
      title: 'Voice check intro',
      body: 'We need the mic for live pitch detection, onboarding, singing drills, and playback moments you choose to open.',
      cta: 'Allow microphone',
    }
  }, [kind])
  const uiCopy = {
    deniedTitle: 'Permission denied',
    deniedBody: 'You can enable access now or continue and come back later.',
    requestFailedTitle: 'Something went wrong.',
    requestFailedBody: 'We could not request permission cleanly. Please try again.',
    hexSubtitle: 'We only ask now because you are about to use a live singing moment.',
  }

  useEffect(() => {
    // Pre-check permission so the primer doesn't block users who already granted.
    ;(async () => {
      try {
        if (kind === 'camera') {
          const cam = await Camera.getCameraPermissionsAsync()
          const mic = await Camera.getMicrophonePermissionsAsync()
          setGranted(!!cam.granted && !!mic.granted)
        } else {
          const p = await Audio.getPermissionsAsync()
          setGranted(!!p.granted)
        }
      } catch {
        setGranted(false)
      }
    })()
  }, [kind])

  const markSeen = async () => {
    const s = await getSettings().catch(() => null)
    if (!s) return
    if (kind === 'camera') s.seenCameraPrimer = true
    else s.seenMicPrimer = true
    await upsertSettings(s)
  }

  const request = async () => {
    setBusy(true)
    try {
      if (kind === 'camera') {
        const cam = await Camera.requestCameraPermissionsAsync()
        const mic = await Camera.requestMicrophonePermissionsAsync()
        const ok = !!cam.granted && !!mic.granted
        setGranted(ok)
        await markSeen()
        if (!ok) {
          Alert.alert(uiCopy.deniedTitle, uiCopy.deniedBody)
        }
      } else {
        const p = await Audio.requestPermissionsAsync()
        const ok = !!p.granted
        setGranted(ok)
        await markSeen()
        if (!ok) {
          Alert.alert(uiCopy.deniedTitle, uiCopy.deniedBody)
        }
      }
    } catch {
      Alert.alert(uiCopy.requestFailedTitle, uiCopy.requestFailedBody)
    } finally {
      setBusy(false)
    }
  }

  const openSettings = async () => {
    await markSeen()
    // iOS/Android deep link to app settings.
    const url = Platform.OS === 'ios' ? 'app-settings:' : undefined
    try {
      if (url) await Linking.openURL(url)
      else await Linking.openSettings()
    } catch {
      // ignore
    }
  }

  const done = async () => {
    await markSeen()
    if (next?.name) {
      try {
        navigation.replace(next.name, next.params)
        return
      } catch {
        // fall through
      }
    }
    navigation.goBack()
  }

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <Box gap={12}>
        <Text preset="h1">{copy.title}</Text>
        <Text preset="muted">{copy.body}</Text>
        <HexagonStateRenderer
          state={granted ? 'ready' : 'listening'}
          title={kind === 'camera' ? 'Camera + voice check' : 'Voice check intro'}
          subtitle={uiCopy.hexSubtitle}
        />

        <TrustBulletRow
          bullets={
            kind === 'camera'
              ? [
                  'Your recording stays on-device unless you choose to share it.',
                  'We use the mic to detect pitch and the camera only in performance moments you start.',
                  'You can still use the singing journey without posting anything.',
                ]
              : [
                  'Pitch is analyzed on-device by default where possible.',
                  'We only listen inside live singing moments you start.',
                  'This first check is built to leave you with a win, not a diagnosis.',
                ]
          }
        />

        <PrimaryActionBar
          primaryLabel={busy ? 'Requesting permission…' : copy.cta}
          onPrimary={() => void request()}
          secondaryLabel={granted ? 'Continue' : 'Open Settings'}
          onSecondary={granted ? () => void done() : () => void openSettings()}
          helperText="No creepy background listening. No early paywall. Just the next live step."
        />
        <Button text={granted ? 'Continue' : 'Not now'} variant="ghost" onPress={() => void done()} />
      </Box>
    </Screen>
  )
}
