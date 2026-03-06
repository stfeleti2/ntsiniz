import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import type { RootStackParamList } from '@/app/navigation/types'
import { getChallengeState, getTodayChallengeDay, resetChallenge } from '@/core/challenges/pitchLockChallenge'
import { ShareCard } from '@/ui/share/ShareCard'
import { shareCapturedCard } from '@/ui/share/shareCardCapture'

type Props = NativeStackScreenProps<RootStackParamList, 'PitchLockChallenge'>

export function PitchLockChallengeScreen({ navigation }: Props) {
  const [state, setState] = useState<any>(null)
  const cardRef = useRef<any>(null)

  useEffect(() => {
    getChallengeState().then(setState)
  }, [])

  const today = state ? getTodayChallengeDay(state) : 1

  const share = async () => {
    await shareCapturedCard(cardRef.current, `pitch_lock_challenge_${Date.now()}.png`)
  }

  const doneCount = useMemo(() => (state?.days ?? []).filter((d: any) => !!d.completedAt).length, [state])

  return (
    <Screen scroll background="hero">
      <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text preset="h1">{t('challenge.pitchLockTitle') ?? '7‑Day Pitch Lock'}</Text>
        <Button text={t('common.close') ?? 'Close'} variant="ghost" onPress={() => navigation.goBack()} />
      </Box>

      <Card tone="glow">
        <Text preset="h2">{(t('challenge.today', { day: today }) as any) ?? `Today: Day ${today}`}</Text>
        <Text preset="muted">{t('challenge.body') ?? 'Do one short drill per day. Share your progress.'}</Text>
        <Box style={{ height: 10 }} />
        <Button text={t('challenge.share') ?? 'Share progress'} onPress={share} />
        <Box style={{ height: 10 }} />
        <Button
          text={t('challenge.reset') ?? 'Reset challenge'}
          variant="soft"
          onPress={async () => setState(await resetChallenge())}
        />
      </Card>

      {(state?.days ?? []).map((d: any) => (
        <Card key={d.day} tone={d.completedAt ? 'elevated' : 'default'}>
          <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text preset="h2">{(t('challenge.day', { day: d.day }) as any) ?? `Day ${d.day}`}</Text>
            <Text preset="muted">{d.completedAt ? '✅' : d.day === today ? '👉' : '🔒'}</Text>
          </Box>
          <Text preset="muted">
            {d.completedAt
              ? (t('challenge.completed', { score: d.bestScore ?? 0 }) as any) ?? `Completed • Best ${d.bestScore ?? 0}`
              : d.day === today
                ? (t('challenge.doToday') ?? 'Do your session today to complete this day.')
                : (t('challenge.locked') ?? 'Complete previous days to unlock.')}
          </Text>
        </Card>
      ))}

      {/* share card */}
      <Box style={{ opacity: 0.001, height: 1 }} />
      <ShareCard ref={cardRef} title={t('brand.name')} subtitle={t('challenge.pitchLockTitle') ?? '7‑Day Pitch Lock'}>
        <Text preset="h2">{t('challenge.cardTitle') ?? 'Pitch Lock Challenge'}</Text>
        <Text preset="muted">{`${doneCount}/7 ${t('challenge.daysCompleted') ?? 'days completed'}`}</Text>
      </ShareCard>
    </Screen>
  )
}
