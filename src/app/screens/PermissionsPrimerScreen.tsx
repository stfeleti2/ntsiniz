import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Linking, Platform, StyleSheet, View } from 'react-native'
import { Camera } from 'expo-camera'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'

import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { Box } from '@/ui'
import { BrandWorldBackdrop } from '@/ui/guidedJourney'
import { getSettings, upsertSettings } from '@/core/storage/settingsRepo'
import { StatusPill } from '@/ui/guidedJourney'
import { getMicPermissionState, requestMicPermission, type MicPermissionState } from '@/core/audio/micStream'
import { t } from '@/app/i18n'

type Kind = 'mic' | 'camera'
type PermissionUiState = 'notRequested' | 'granted' | 'denied' | 'blocked' | 'error'

type PermissionStatusLike = {
  granted: boolean
  canAskAgain?: boolean
  status?: string
}

export function PermissionsPrimerScreen({ navigation, route }: any) {
  const kind: Kind = route?.params?.kind ?? 'mic'
  const next = route?.params?.next
  const isMic = kind === 'mic'

  const [busy, setBusy] = useState(false)
  const [state, setState] = useState<PermissionUiState>('notRequested')
  const [statusText, setStatusText] = useState('')

  const copy = useMemo(
    () => ({
      title: 'Enable your microphone',
      body: isMic
        ? 'Pitch detection, scoring, and live feedback need clean microphone access.'
        : 'Camera is optional, but this path requests recording permissions first.',
      hintLine: isMic ? 'You can still explore without mic, but singing drills need access.' : 'You can continue and enable camera later.',
      start: 'Press below to start',
      begin: isMic ? 'Begin first exercise' : 'Continue',
      retry: 'Try again',
      openSettings: 'Open settings',
      continueWithout: isMic ? 'Continue without mic' : 'Continue',
      refresh: 'Check again',
      busy: 'Requesting…',
      grantedLabel: 'Microphone ready',
      deniedLabel: 'Microphone denied',
      blockedLabel: 'Settings required',
      notRequestedLabel: 'Not requested yet',
      errorLabel: 'Permission check failed',
      grantedInstruction: 'Nice, we can hear you clearly.',
      deniedInstruction: 'You can retry now. Singing drills need microphone access.',
      blockedInstruction: 'Enable microphone in Settings, then come back.',
      unknownInstruction: 'We could not confirm permission. Retry once.',
    }),
    [isMic],
  )

  const deriveUiState = useCallback((permission: PermissionStatusLike): PermissionUiState => {
    if (permission.granted) return 'granted'
    if (permission.status === 'undetermined') return 'notRequested'
    if (permission.canAskAgain === false) return 'blocked'
    return 'denied'
  }, [])

  const markSeen = useCallback(async () => {
    const settings = await getSettings().catch(() => null)
    if (!settings) return
    if (isMic) settings.seenMicPrimer = true
    else settings.seenCameraPrimer = true
    await upsertSettings(settings).catch(() => {})
  }, [isMic])

  const setFromState = useCallback(
    (nextState: PermissionUiState) => {
      setState(nextState)
      setStatusText(
        nextState === 'granted'
          ? copy.grantedInstruction
          : nextState === 'denied'
            ? copy.deniedInstruction
            : nextState === 'blocked'
              ? copy.blockedInstruction
              : nextState === 'notRequested'
                ? copy.start
                : copy.unknownInstruction,
      )
    },
    [copy.blockedInstruction, copy.deniedInstruction, copy.grantedInstruction, copy.start, copy.unknownInstruction],
  )

  const loadCurrentState = useCallback(async () => {
    try {
      if (isMic) {
        const micState = await getMicPermissionState()
        setFromState(fromMicState(micState))
        return
      }
      const permission = await Camera.getCameraPermissionsAsync()
      setFromState(deriveUiState(permission as PermissionStatusLike))
    } catch {
      setFromState('error')
    }
  }, [deriveUiState, isMic, setFromState])

  useEffect(() => {
    void loadCurrentState()
  }, [loadCurrentState])

  useEffect(() => {
    const sub = navigation?.addListener?.('focus', () => {
      void loadCurrentState()
    })
    return () => {
      sub?.()
    }
  }, [loadCurrentState, navigation])

  const requestPermission = async () => {
    setBusy(true)
    try {
      const nextState = isMic
        ? fromMicState(await requestMicPermission())
        : deriveUiState((await Camera.requestCameraPermissionsAsync()) as PermissionStatusLike)
      await markSeen()
      setFromState(nextState)
    } catch {
      setFromState('error')
    } finally {
      setBusy(false)
    }
  }

  const openSettings = async () => {
    await markSeen()
    try {
      if (Platform.OS === 'ios') await Linking.openURL('app-settings:')
      else await Linking.openSettings()
    } catch {
      // no-op
    }
  }

  const goNext = async () => {
    await markSeen()
    if (next?.name) {
      navigation.replace(next.name, next.params)
      return
    }
    navigation.goBack()
  }

  const statusMeta = {
    notRequested: { pillState: 'paused' as const, pillLabel: copy.notRequestedLabel, icon: '◌' },
    granted: { pillState: 'success' as const, pillLabel: copy.grantedLabel, icon: '✓' },
    denied: { pillState: 'retry' as const, pillLabel: copy.deniedLabel, icon: '↺' },
    blocked: { pillState: 'blocked' as const, pillLabel: copy.blockedLabel, icon: '!' },
    error: { pillState: 'retry' as const, pillLabel: copy.errorLabel, icon: '?' },
  }[state]

  const instructionLine = {
    notRequested: 'Press below to start',
    granted: 'Permission is on. Next: begin your first voice check.',
    denied: 'You can still explore, but singing features need microphone access.',
    blocked: 'Microphone is blocked. Enable it in Settings to continue singing.',
    error: 'We could not confirm permission. Retry once.',
  }[state]

  const primaryButton = {
    notRequested: { text: busy ? copy.busy : copy.start, onPress: requestPermission, disabled: busy },
    granted: { text: copy.begin, onPress: goNext, disabled: false },
    denied: { text: busy ? copy.busy : copy.retry, onPress: requestPermission, disabled: busy },
    blocked: { text: copy.openSettings, onPress: openSettings, disabled: false },
    error: { text: copy.refresh, onPress: loadCurrentState, disabled: false },
  }[state]

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <Card tone="glow" style={{ overflow: 'hidden' }}>
        <LinearGradient colors={['rgba(95,55,220,0.5)', 'rgba(31,18,78,0.84)']} style={StyleSheet.absoluteFill} />
        <Box style={{ gap: 8 }}>
          <Text preset="h1">{copy.title}</Text>
          <Text preset="muted">{copy.body}</Text>
        </Box>
      </Card>

      <BlurView intensity={48} tint="dark" style={styles.statusCard}>
        <Box style={{ gap: 12, alignItems: 'center' }}>
          <StatusPill state={statusMeta.pillState} label={statusMeta.pillLabel} />
          <View style={styles.iconBubble}>
            <Text preset="h2">{statusMeta.icon}</Text>
          </View>
          <Text preset="body" style={{ textAlign: 'center' }}>
            {statusText}
          </Text>
          <Text preset="muted" style={{ textAlign: 'center' }}>
            {instructionLine}
          </Text>
        </Box>
      </BlurView>

      <Card tone="elevated">
        <Box style={{ gap: 10 }}>
          <Text preset="muted">{copy.hintLine}</Text>
          <Text preset="muted">{t('guidedFlow.permissionsNowWhyNext')}</Text>
          <Button text={primaryButton.text} onPress={primaryButton.onPress} disabled={primaryButton.disabled} />
          {(state === 'denied' || state === 'blocked' || state === 'error') && isMic ? (
            <Button text={copy.continueWithout} variant="ghost" onPress={goNext} />
          ) : null}
        </Box>
      </Card>
    </Screen>
  )
}

function fromMicState(state: MicPermissionState): PermissionUiState {
  if (state === 'notRequested') return 'notRequested'
  if (state === 'granted') return 'granted'
  if (state === 'blocked') return 'blocked'
  if (state === 'denied') return 'denied'
  return 'error'
}

const styles = StyleSheet.create({
  statusCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(202,192,255,0.42)',
    overflow: 'hidden',
    padding: 16,
    backgroundColor: 'rgba(27,20,53,0.58)',
    shadowColor: '#090613',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  iconBubble: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(149,132,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(211,203,255,0.46)',
    shadowColor: '#8F82FF',
    shadowOpacity: 0.26,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
})
