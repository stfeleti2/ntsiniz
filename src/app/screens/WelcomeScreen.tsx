import React, { useEffect, useState } from "react"
import { Pressable } from "@/ui/primitives"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Screen } from "@/ui/components/Screen"
import { Text, Stack } from "@/ui/primitives"
import { Button } from "@/ui/components/Button"
import { Card } from "@/ui/components/Card"
import type { RootStackParamList } from "../navigation/types"
import { getSettings } from "@/core/storage/settingsRepo"
import { t } from '@/app/i18n'
import { BrandWorldBackdrop, ChapterHeroCard, HexagonHero, TrustBulletRow } from '@/ui/guidedJourney'
import { enableGuidedJourneyV3 } from '@/core/config/flags'

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">

export function WelcomeScreen({ navigation }: Props) {
  const [ready, setReady] = useState(false)
  const [firstWinComplete, setFirstWinComplete] = useState(false)
  const [showHow, setShowHow] = useState(false)
  const [devTap, setDevTap] = useState(0)
  const showDev = __DEV__ && devTap >= 7
  const copy = {
    subtitle: 'A guided singing journey that gives you a tiny win before it asks anything big.',
    heroTitle: 'Tiny game. Real signal.',
    heroBody: 'We start with one guided voice moment, then turn it into your first chapter.',
    cardTitle: 'Your first win starts here',
    cardBody: 'No cold scan. No early paywall. Just a short guided check that leaves you with momentum.',
    cardStage: 'Entry',
    enter: 'Enter your journey',
    start: 'Start first win',
    showHow: 'How it works',
    hideHow: 'Hide how it works',
    devRetune: 'Go to retune utility',
    privacy: 'Privacy: your voice is yours. We only listen inside the moments you start.',
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
    if (enableGuidedJourneyV3() && firstWinComplete) navigation.replace('MainTabs')
  }, [ready, firstWinComplete, navigation])

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <Stack gap={12}>
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
        <Text tone="muted">{copy.subtitle}</Text>
      </Stack>

      <HexagonHero state="ready" title={copy.heroTitle} subtitle={copy.heroBody} />

      <ChapterHeroCard
        title={copy.cardTitle}
        subtitle={copy.cardBody}
        stageLabel={copy.cardStage}
        cta={ready ? (firstWinComplete ? copy.enter : copy.start) : t('common.loading')}
        onPress={() => (firstWinComplete ? navigation.replace('MainTabs') : navigation.navigate('Onboarding'))}
      />

      <Button text={showHow ? copy.hideHow : copy.showHow} variant="ghost" onPress={() => setShowHow((value) => !value)} />

      {showHow ? (
        <Card>
          <TrustBulletRow
            bullets={[
              'We ask about your goal and coaching style first, then mic access only when you are ready.',
              'Your first voice check is short, supportive, and built to give you a usable win.',
              'Pitch is analyzed on-device by default and your recordings stay on your device unless you choose to share.',
            ]}
          />
        </Card>
      ) : null}

      {showDev ? <Button text={copy.devRetune} variant="ghost" onPress={() => navigation.navigate('Calibration')} /> : null}

      <Text tone="muted">{copy.privacy}</Text>
    </Screen>
  )
}
