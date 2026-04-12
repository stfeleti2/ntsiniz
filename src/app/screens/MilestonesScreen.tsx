import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Box } from '@/ui'
import { listRecentAttempts } from '@/core/storage/attemptsRepo'
import { listSessionAggregates } from '@/core/storage/sessionsRepo'
import { BrandWorldBackdrop, MilestoneCard, NextStepCard } from '@/ui/guidedJourney'

type Props = NativeStackScreenProps<RootStackParamList, 'Milestones'>

const copy = {
  title: 'Milestones',
  subtitle: 'Unlocked wins, current streak, and a safe place to branch into sharing.',
  loading: 'Loading milestones…',
  sessionsTitle: 'Sessions',
  attemptsTitle: 'Attempts',
  bestScoreTitle: 'Best score',
  streakTitle: 'Streak',
  shareTitle: 'Weekly flex / share card',
  shareBody: 'The shareable progress-card entry stays on safe closure surfaces.',
  shareCta: 'Open weekly report',
  compare: 'Compare progress',
}

export function MilestonesScreen({ navigation }: Props) {
  const [vm, setVm] = useState<{ sessions: number; attempts: number; best: number; streak: number } | null>(null)

  useEffect(() => {
    ;(async () => {
      const [sessions, attempts] = await Promise.all([listSessionAggregates(180), listRecentAttempts(400)])
      setVm({
        sessions: sessions.filter((row) => row.attemptCount > 0).length,
        attempts: attempts.length,
        best: Math.round(Math.max(0, ...sessions.map((row) => row.avgScore))),
        streak: computeStreak(sessions),
      })
    })().catch(() => setVm(null))
  }, [])

  if (!vm) {
    return (
      <Screen background="hero">
        <BrandWorldBackdrop />
        <Text preset="h1">{copy.title}</Text>
        <Text preset="muted">{copy.loading}</Text>
      </Screen>
    )
  }

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{copy.title}</Text>
        <Text preset="muted">{copy.subtitle}</Text>
      </Box>

      <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <MilestoneCard title={copy.sessionsTitle} body="Guided sessions completed." stat={String(vm.sessions)} />
        <MilestoneCard title={copy.attemptsTitle} body="Recorded attempt count." stat={String(vm.attempts)} />
        <MilestoneCard title={copy.bestScoreTitle} body="Best recent session average." stat={String(vm.best)} />
        <MilestoneCard title={copy.streakTitle} body="Current day streak." stat={String(vm.streak)} />
      </Box>

      <NextStepCard title={copy.shareTitle} body={copy.shareBody} cta={copy.shareCta} onPress={() => navigation.navigate('WeeklyReport')} />
      <Button text={copy.compare} variant="ghost" onPress={() => navigation.navigate('CompareProgress')} />
    </Screen>
  )
}

function computeStreak(rows: Array<{ startedAt: number; attemptCount: number }>) {
  const days = Array.from(
    new Set(
      rows
        .filter((row) => row.attemptCount > 0)
        .map((row) => {
          const date = new Date(row.startedAt)
          date.setHours(0, 0, 0, 0)
          return date.getTime()
        }),
    ),
  ).sort((a, b) => b - a)

  let streak = 0
  const expected = new Date()
  expected.setHours(0, 0, 0, 0)
  let expectedMs = expected.getTime()

  for (const day of days) {
    if (day === expectedMs) {
      streak += 1
      expectedMs -= 24 * 60 * 60 * 1000
      continue
    }
    if (streak === 0 && day === expectedMs - 24 * 60 * 60 * 1000) {
      streak += 1
      expectedMs = day - 24 * 60 * 60 * 1000
      continue
    }
    break
  }

  return streak
}
