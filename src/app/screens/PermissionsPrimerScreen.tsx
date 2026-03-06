import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Linking, Platform } from 'react-native'
import { Audio } from 'expo-av'
import { Camera } from 'expo-camera'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { getSettings, upsertSettings } from '@/core/storage/settingsRepo'

type Kind = 'mic' | 'camera'

export function PermissionsPrimerScreen({ navigation, route }: any) {
  const kind: Kind = route?.params?.kind ?? 'mic'
  const next = route?.params?.next
  const [busy, setBusy] = useState(false)
  const [granted, setGranted] = useState(false)

  const copy = useMemo(() => {
    if (kind === 'camera') {
      return {
        title: t('permissions.cameraPrimerTitle'),
        body: t('permissions.cameraPrimerBody'),
        cta: t('permissions.allowCamera'),
      }
    }
    return {
      title: t('permissions.micPrimerTitle'),
      body: t('permissions.micPrimerBody'),
      cta: t('permissions.allowMic'),
    }
  }, [kind])

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
          Alert.alert(t('permissions.permissionDeniedTitle'), t('permissions.permissionDeniedBody'))
        }
      } else {
        const p = await Audio.requestPermissionsAsync()
        const ok = !!p.granted
        setGranted(ok)
        await markSeen()
        if (!ok) {
          Alert.alert(t('permissions.permissionDeniedTitle'), t('permissions.permissionDeniedBody'))
        }
      }
    } catch {
      Alert.alert(t('common.error'), t('permissions.permissionRequestFailed'))
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
    <Screen title={copy.title} scroll>
      <Box gap={12}>
        <Card tone="glow">
          <Box gap={8}>
            <Text size="lg" weight="semibold">{copy.title}</Text>
            <Text muted>{copy.body}</Text>
          </Box>
        </Card>

        <Card>
          <Box gap={10}>
            <Button title={busy ? t('common.loading') : copy.cta} onPress={request} disabled={busy} />
            <Button title={t('permissions.openSettings')} variant="soft" onPress={openSettings} />
            <Button title={granted ? t('common.continue') : t('common.notNow')} variant="ghost" onPress={done} />
          </Box>
        </Card>
      </Box>
    </Screen>
  )
}
