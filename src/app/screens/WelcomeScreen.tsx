import React, { useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { Screen } from '@/ui/components/Screen'
import { Text, Stack, Pressable } from '@/ui/primitives'
import { Button } from '@/ui/components/Button'

import type { RootStackParamList } from '../navigation/types'
import { getSettings } from '@/core/storage/settingsRepo'
import { t } from '@/app/i18n'

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>

type RevealContext = NonNullable<NonNullable<RootStackParamList['Welcome']>['context']>

const REVEAL_COPY: Record<
  RevealContext,
  {
    slogan: string
    tip: string
    durationMs: number
  }
> = {
  firstTime: {
    slogan: 'A fair ear for your voice.',
    tip: 'One calm breath first. We will handle the rest.',
    durationMs: 1850,
  },
  returning: {
    slogan: 'Welcome back. Let us sharpen today.',
    tip: 'Short consistent reps beat long random ones.',
    durationMs: 1450,
  },
  nextLesson: {
    slogan: 'Loading your next lesson.',
    tip: 'Clear reps now make songs easier later.',
    durationMs: 1250,
  },
  postSession: {
    slogan: 'Session captured. Momentum kept.',
    tip: 'Playback, save best, then keep moving.',
    durationMs: 1400,
  },
  milestone: {
    slogan: 'Milestone unlocked.',
    tip: 'Progress is proof, not luck.',
    durationMs: 1500,
  },
  recentProgress: {
    slogan: 'Your progress is moving.',
    tip: 'Keep the same calm focus into the next lesson.',
    durationMs: 1450,
  },
}

export function WelcomeScreen({ navigation, route }: Props) {
  const [ready, setReady] = useState(false)
  const [firstWinComplete, setFirstWinComplete] = useState(false)
  const [devTap, setDevTap] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const context = useMemo<RevealContext>(() => {
    const explicit = route.params?.context
    if (explicit) return explicit
    return firstWinComplete ? 'returning' : 'firstTime'
  }, [route.params?.context, firstWinComplete])

  const copy = {
    ...REVEAL_COPY[context],
    topTag: 'Singing Studio',
    devSkip: 'Skip intro (dev)',
  }

  useEffect(() => {
    getSettings()
      .then((s) => {
        setFirstWinComplete(!!s.firstWinComplete)
      })
      .catch(() => {})
      .finally(() => setReady(true))
  }, [])

  useEffect(() => {
    if (!ready) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const explicitNext = route.params?.next
      if (explicitNext?.name) {
        navigation.replace(explicitNext.name as any, explicitNext.params)
        return
      }
      if (firstWinComplete) navigation.replace('MainTabs')
      else navigation.replace('Onboarding')
    }, copy.durationMs)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [copy.durationMs, firstWinComplete, navigation, ready, route.params?.next])

  const devUnlocked = __DEV__ && devTap >= 7
  const topLabel = t('brand.name')

  return (
    <Screen background="hero">
      <LinearGradient colors={['rgba(43,22,97,0.62)', 'rgba(7,7,18,0.38)', 'rgba(62,32,132,0.54)']} style={StyleSheet.absoluteFill} />
      <Stack justify="space-between" style={{ flex: 1 }}>
        <Stack gap={8}>
          <Pressable
            testID="tap-welcome-title"
            accessibilityRole="button"
            accessibilityLabel={topLabel}
            onPress={() => setDevTap((x) => x + 1)}
            style={{ alignSelf: 'flex-start', paddingVertical: 4 }}
          >
            <Text size="sm" tone="muted">
              {copy.topTag}
            </Text>
            <Text size="2xl" weight="bold">
              {topLabel}
            </Text>
          </Pressable>
        </Stack>

        <Stack align="center" gap={16}>
          <AmbientRevealOrb />
          <Text size="xl" weight="semibold" style={{ textAlign: 'center' }}>
            {copy.slogan}
          </Text>
        </Stack>

        <Stack gap={10}>
          <BlurView intensity={42} tint="dark" style={styles.tipCard}>
            <Text size="sm" tone="muted" style={{ textAlign: 'center' }}>
              {copy.tip}
            </Text>
          </BlurView>
          {devUnlocked ? (
            <Button text={copy.devSkip} variant="ghost" testID="btn-qa-skip-calibration" onPress={() => navigation.replace('MainTabs')} />
          ) : null}
        </Stack>
      </Stack>
    </Screen>
  )
}

function AmbientRevealOrb() {
  const pulse = useSharedValue(0.42)
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }), -1, true)
  }, [pulse])

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 0.88 + pulse.value * 0.18 }],
    opacity: 0.45 + pulse.value * 0.42,
  }))

  return (
    <View style={styles.orbWrap}>
      <Animated.View style={[styles.orbOuter, style]}>
        <LinearGradient colors={['rgba(140,101,255,0.56)', 'rgba(85,232,255,0.26)']} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <BlurView intensity={28} tint="dark" style={styles.orbInner} />
    </View>
  )
}

const styles = StyleSheet.create({
  tipCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(208,196,255,0.34)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(25,18,51,0.5)',
    shadowColor: '#080412',
    shadowOpacity: 0.34,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  orbWrap: {
    width: 196,
    height: 196,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbOuter: {
    width: 178,
    height: 178,
    borderRadius: 89,
    borderWidth: 1,
    borderColor: 'rgba(216,208,255,0.44)',
    shadowColor: '#A590FF',
    shadowOpacity: 0.5,
    shadowRadius: 42,
    shadowOffset: { width: 0, height: 18 },
  },
  orbInner: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: 'rgba(244,240,255,0.54)',
    backgroundColor: 'rgba(230,220,255,0.15)',
  },
})
