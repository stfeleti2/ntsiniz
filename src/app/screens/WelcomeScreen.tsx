import React, { useEffect, useMemo, useState } from "react"
import { Pressable } from "@/ui/primitives"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Screen } from "@/ui/components/Screen"
import { Text, Stack } from "@/ui/primitives"
import { Button, Card } from "@/ui/components/kit"
import type { RootStackParamList } from "../navigation/types"
import { getSettings, upsertSettings } from "@/core/storage/settingsRepo"
import { t } from '@/app/i18n'

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">

export function WelcomeScreen({ navigation }: Props) {
  const [ready, setReady] = useState(false)
  const [hasCal, setHasCal] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [devTap, setDevTap] = useState(0)
  const showDev = __DEV__ && devTap >= 7

  useEffect(() => {
    getSettings()
      .then((s) => {
        setHasCal(!!s.hasCalibrated)
        setNeedsOnboarding(!!s.hasCalibrated && !s.onboardingComplete)
      })
      .catch(() => {})
      .finally(() => setReady(true))
  }, [])

  // Auto-forward returning users.
  useEffect(() => {
    if (!ready) return
    if (!hasCal) return
    if (needsOnboarding) {
      navigation.replace('Onboarding')
      return
    }
    navigation.replace('MainTabs')
  }, [ready, hasCal, needsOnboarding])

  const primaryLabel = useMemo(() => {
    if (!ready) return t('common.loading')
    return hasCal ? t('welcome.enter') : t('welcome.calibrate')
  }, [ready, hasCal])

  const primaryAction = () => {
    if (!hasCal) {
      navigation.navigate('PermissionsPrimer', { kind: 'mic', next: { name: 'Calibration' } })
      return
    }
    else if (needsOnboarding) navigation.replace('Onboarding')
    else navigation.replace("MainTabs")
  }

  const skipCalibration = async () => {
    const s = await getSettings()
    await upsertSettings({
      ...s,
      noiseGateRms: s.noiseGateRms ?? 0.02,
      hasCalibrated: true,
      qaSimulatedMic: true,
      qaMockShare: true,
      qaBypassMicPermission: true,
    })
    navigation.replace("Onboarding")
  }

  return (
    <Screen scroll background="hero">
      <Stack gap={6}>
        <Pressable
          testID="tap-welcome-title"
          accessibilityRole="button"
          accessibilityLabel={t('brand.name')}
          onPress={() => setDevTap((x) => x + 1)}
        >
          <Text size="xl" weight="bold" style={{ fontSize: 28, lineHeight: 34 }}>
            {t('brand.name')}
          </Text>
        </Pressable>
        <Text tone="muted">{t('welcome.subtitle')}</Text>
      </Stack>

      <Card>
        <Text size="lg" weight="bold">
          {t('welcome.weeklyFlexTitle')}
        </Text>
        <Text tone="muted">{t('welcome.weeklyFlexSubtitle')}</Text>
        <Button label={primaryLabel} disabled={!ready} onPress={primaryAction} testID="btn-welcome-primary" />
        {hasCal ? (
          <Button label={t('welcome.recalibrate')} variant="ghost" onPress={() => navigation.navigate("Calibration")} testID="btn-welcome-recalibrate" />
        ) : null}

        {showDev ? (
          <Button label={t('welcome.qaSkipCalibration')} variant="ghost" onPress={skipCalibration} testID="btn-qa-skip-calibration" />
        ) : null}
      </Card>

      <Card>
        <Text size="lg" weight="bold">
          {t('welcome.whatYouDoTitle')}
        </Text>
        <Stack gap={10}>
          <Text tone="muted">{t('welcome.bullet.listenSing')}</Text>
          <Text tone="muted">{t('welcome.bullet.adapt')}</Text>
          <Text tone="muted">{t('welcome.bullet.journey')}</Text>
          <Text tone="muted">{t('welcome.bullet.shareable')}</Text>
        </Stack>
      </Card>

      <Text tone="muted">{t('welcome.privacy')}</Text>
    </Screen>
  )
}