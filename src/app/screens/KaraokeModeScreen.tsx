import React, { useEffect, useMemo, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Card } from '@/ui/components/kit'
import { Box } from '@/ui'
import { track } from '@/app/telemetry'
import { loadAllBundledPacks } from '@/core/drills/loader'
import { createSession } from '@/core/storage/sessionsRepo'
import { createSessionPlanFromIds } from '@/core/profile/sessionPlan'
import { ensureJourneyV3Progress } from '@/core/guidedJourney/progress'
import { BrandWorldBackdrop, ChapterHeroCard, CoachInset, CurrentZoneChip, StatusPill, VoiceGuideCard } from '@/ui/guidedJourney'

type Props = NativeStackScreenProps<RootStackParamList, 'KaraokeMode'>

type SongPhraseVm = {
  id: string
  title: string
  noteLine: string
  helper: string
}

const copy = {
  title: 'Song mode',
  subtitle: 'Real phrase drills with a lower-chrome, more musical launcher.',
  heroBody: 'Use this when you want melody-first reps instead of isolated note work.',
  helperTitle: 'How to use it',
  helperBody: 'Listen once, imagine the phrase as one shape, then answer without chasing every note.',
  selectTitle: 'Pick a phrase',
  stageLabel: 'Song phrase',
  ready: 'Ready',
  queued: 'Queued',
  choosePhrase: 'Choose phrase',
  start: 'Start song rep',
  back: 'Back',
  loading: 'Loading song phrases…',
}

export function KaraokeModeScreen({ navigation, route }: Props) {
  const [phrases, setPhrases] = useState<SongPhraseVm[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(route.params?.drillId ?? null)

  useEffect(() => {
    const pack = loadAllBundledPacks()
    const next = pack.drills
      .filter((drill) => drill.id.startsWith('song_phrase_'))
      .map((drill) => ({
        id: drill.id,
        title: drill.title,
        noteLine: drill.melody?.map((note) => note.note).join(' · ') ?? 'Phrase contour',
        helper:
          drill.id === 'song_phrase_twinkle_a'
            ? 'A familiar contour that helps you stay relaxed.'
            : drill.id === 'song_phrase_twinkle_b'
              ? 'A gentle descent that rewards clean landings.'
              : drill.id === 'song_phrase_scale_up'
                ? 'A rising phrase that teaches step-by-step lift.'
                : 'A falling phrase that teaches calm release.',
      }))
    setPhrases(next)
    if (!selectedId) setSelectedId(next[0]?.id ?? null)
  }, [])

  const selected = useMemo(() => phrases.find((item) => item.id === selectedId) ?? null, [phrases, selectedId])

  const startPhrase = async () => {
    if (!selected) return
    const [session, progress] = await Promise.all([createSession(), ensureJourneyV3Progress()])
    createSessionPlanFromIds(session.id, [selected.id])
    track('karaoke_started', { drillId: selected.id } as any)
    navigation.navigate('Drill', {
      sessionId: session.id,
      drillId: selected.id,
      lessonId: progress.lessonId ?? undefined,
      stageId: progress.stageId ?? undefined,
    })
  }

  if (!phrases.length) {
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

      <ChapterHeroCard
        title={selected?.title ?? copy.title}
        subtitle={copy.heroBody}
        stageLabel={copy.stageLabel}
        cta={copy.start}
        onPress={() => void startPhrase()}
      />

      <VoiceGuideCard title={copy.helperTitle} body={copy.helperBody} pill={selected ? selected.noteLine : copy.ready} />
      {selected ? <CoachInset title={copy.ready} body={selected.helper} /> : null}

      <Card tone="elevated">
        <Text preset="h2">{copy.selectTitle}</Text>
        <Box style={{ height: 10 }} />
        <Box style={{ gap: 10 }}>
          {phrases.map((phrase) => {
            const active = phrase.id === selectedId
            return (
              <Card key={phrase.id} tone={active ? 'glow' : 'default'}>
                <Box style={{ gap: 8 }}>
                  <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <Text preset="body" style={{ fontWeight: '900', flex: 1 }}>{phrase.title}</Text>
                    <StatusPill state={active ? 'ready' : 'paused'} label={active ? copy.ready : copy.queued} />
                  </Box>
                  <CurrentZoneChip label={phrase.noteLine} />
                  <Text preset="muted">{phrase.helper}</Text>
                  <Button text={active ? copy.start : copy.choosePhrase} variant={active ? 'primary' : 'soft'} onPress={() => setSelectedId(phrase.id)} />
                </Box>
              </Card>
            )
          })}
        </Box>
      </Card>

      <Button text={copy.start} onPress={() => void startPhrase()} />
      <Button text={copy.back} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
