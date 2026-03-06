import React, { useEffect, useMemo, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { ensureSelfPerson, updateSelfProfile } from '@/core/social/peopleRepo'
import { getSettings, upsertSettings } from '@/core/storage/settingsRepo'
import { t } from '@/app/i18n'

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>

type Goal = 'practice' | 'social' | 'compete' | 'coach'

export function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [name, setName] = useState<string>('')
  const [goal, setGoal] = useState<Goal>('practice')

  useEffect(() => {
    ;(async () => {
      const me = await ensureSelfPerson()
      setName(me.displayName === 'You' ? '' : me.displayName)
      const s = await getSettings()
      if (s.onboardingGoal) setGoal(s.onboardingGoal)
    })().catch(() => {})
  }, [])

  const title = useMemo(() => {
    if (step === 0) return t('onboarding.step1Title')
    if (step === 1) return t('onboarding.step2Title')
    return t('onboarding.step3Title')
  }, [step])

  const next = async () => {
    if (step === 0) {
      if (name.trim().length >= 2) {
        await updateSelfProfile({ displayName: name.trim() }).catch(() => {})
      }
      setStep(1)
      return
    }
    if (step === 1) {
      const s = await getSettings()
      await upsertSettings({ ...s, onboardingGoal: goal })
      setStep(2)
      return
    }

    const s = await getSettings()
    await upsertSettings({ ...s, onboardingComplete: true, onboardingGoal: goal })
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' as any }] })
    // First win routing (tailored):
    if (goal === 'practice') (navigation as any).navigate('Tuner')
    if (goal === 'social') (navigation as any).navigate('MainTabs', { screen: 'Community' })
    if (goal === 'compete') (navigation as any).navigate('CompetitionsHub')
    if (goal === 'coach') (navigation as any).navigate('Marketplace')
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{title}</Text>
        <Text preset="muted">{t('onboarding.subtitle')}</Text>
      </Box>

      {step === 0 ? (
        <Card>
          <Text preset="h2">{t('onboarding.nameTitle')}</Text>
          <Text preset="muted">{t('onboarding.nameSubtitle')}</Text>
          {/* Keep it simple: tap-to-cycle suggestions (no TextInput dependency). */}
          <Box style={{ marginTop: 12, gap: 10 }}>
            <Button
              text={name.trim() ? `${t('onboarding.nameCurrent')}: ${name.trim()}` : t('onboarding.namePick')}
              variant="soft"
              onPress={() => {
                const presets = ['Promise', 'Singer', 'Vocalist', 'You']
                const i = Math.max(0, presets.indexOf(name.trim()))
                setName(presets[(i + 1) % presets.length])
              }}
            />
            <Button text={t('common.next')} variant="primary" onPress={next} />
            <Button text={t('common.skip')} variant="ghost" onPress={() => setStep(1)} />
          </Box>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card>
          <Text preset="h2">{t('onboarding.goalTitle')}</Text>
          <Text preset="muted">{t('onboarding.goalSubtitle')}</Text>
          <Box style={{ marginTop: 12, gap: 10 }}>
            <Button text={t('onboarding.goal.practice')} variant={goal === 'practice' ? 'primary' : 'soft'} onPress={() => setGoal('practice')} />
            <Button text={t('onboarding.goal.social')} variant={goal === 'social' ? 'primary' : 'soft'} onPress={() => setGoal('social')} />
            <Button text={t('onboarding.goal.compete')} variant={goal === 'compete' ? 'primary' : 'soft'} onPress={() => setGoal('compete')} />
            <Button text={t('onboarding.goal.coach')} variant={goal === 'coach' ? 'primary' : 'soft'} onPress={() => setGoal('coach')} />
            <Button text={t('common.next')} variant="primary" onPress={next} />
          </Box>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card tone="glow">
          <Text preset="h2">{t('onboarding.firstWinTitle')}</Text>
          <Text preset="muted">{t('onboarding.firstWinSubtitle')}</Text>
          <Box style={{ marginTop: 12, gap: 10 }}>
            <Button text={t('onboarding.finish')} variant="primary" onPress={next} />
            <Text preset="muted" style={{ marginTop: 8 }}>
              {goal === 'practice'
                ? t('onboarding.firstWin.practice')
                : goal === 'social'
                  ? t('onboarding.firstWin.social')
                  : goal === 'compete'
                    ? t('onboarding.firstWin.compete')
                    : t('onboarding.firstWin.coach')}
            </Text>
          </Box>
        </Card>
      ) : null}
    </Screen>
  )
}
