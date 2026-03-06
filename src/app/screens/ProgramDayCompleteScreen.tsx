import React, { useEffect, useMemo, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Alert, TextInput } from 'react-native'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { loadMarketplacePrograms, loadMarketplaceCoaches } from '@/core/marketplace/loader'
import { ensureSelfPerson } from '@/core/social/peopleRepo'
import { markProgramDayComplete } from '@/core/marketplace/enrollmentsRepo'
import { loadAllLessons, findLesson } from '@/core/coaching/lessons'
import { createFeedbackRequest } from '@/core/marketplace/feedbackRepo'
import { decodeCoachCode } from '@/core/marketplace/shareCodes'
import { listClips, getClipById } from '@/core/performance/clipsRepo'
import { createFeedbackPack, shareFile } from '@/app/marketplace/feedbackPack'

type Props = NativeStackScreenProps<RootStackParamList, 'ProgramDayComplete'>

export function ProgramDayCompleteScreen({ navigation, route }: Props) {
  const { programId, day } = route.params
  const programs = useMemo(() => loadMarketplacePrograms(), [])
  const coaches = useMemo(() => loadMarketplaceCoaches(), [])
  const lessons = useMemo(() => loadAllLessons(), [])
  const program = programs.programs.find((p) => p.id === programId)
  const pd = program?.days.find((d) => d.day === day)
  const lesson = findLesson(lessons, pd?.lessonId ?? null)
  const coach = program ? coaches.coaches.find((c) => c.id === program.coachId) : null
  const [coachCode, setCoachCode] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [clips, setClips] = useState<any[]>([])
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)

  useEffect(() => {
    setMessage('')
    setSelectedClipId(null)
  }, [programId, day])

  useEffect(() => {
    listClips(30)
      .then(setClips)
      .catch(() => {})
  }, [])

  if (!program || !pd) {
    return (
      <Screen scroll background="gradient">
        <Text preset="h1">{t('marketplace.notFound')}</Text>
        <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
      </Screen>
    )
  }

  const complete = async () => {
    const me = await ensureSelfPerson()
    await markProgramDayComplete({ userId: me.id, programId: program.id, day })
    Alert.alert(t('marketplace.completedTitle'), t('marketplace.completedBody'))
    navigation.goBack()
  }

  const requestFeedback = async () => {
    const me = await ensureSelfPerson()
    let coachId = program.coachId
    let coachName = coach?.name ?? 'Coach'
    if (coachCode.trim()) {
      const env = decodeCoachCode(coachCode.trim())
      if (env.expiresAt && Date.now() > env.expiresAt) throw new Error('Coach code expired')
      coachId = env.payload.coachId
      coachName = env.payload.coachName
    }
    await createFeedbackRequest({
      coachId,
      coachName,
      studentId: me.id,
      studentName: me.displayName,
      clipId: selectedClipId ?? null,
      message: message.trim() || `${program.title} · Day ${day}: ${pd.title}`,
    })
    Alert.alert(t('marketplace.sentTitle'), t('marketplace.sentBody'))
  }

  const shareOfflinePack = async () => {
    const me = await ensureSelfPerson()
    let coachId = program.coachId
    let coachName = coach?.name ?? 'Coach'
    if (coachCode.trim()) {
      const env = decodeCoachCode(coachCode.trim())
      if (env.expiresAt && Date.now() > env.expiresAt) throw new Error('Coach code expired')
      coachId = env.payload.coachId
      coachName = env.payload.coachName
    }

    const msg = message.trim() || `${program.title} · Day ${day}: ${pd.title}`

    let clipMeta: any = null
    let clipUri: string | null = null
    if (selectedClipId) {
      const c = await getClipById(selectedClipId)
      if (c?.videoUri) {
        clipUri = c.videoUri
        clipMeta = {
          filename: `${selectedClipId}.mp4`,
          mimeType: 'video/mp4',
          durationMs: c.durationMs,
          score: c.score,
          title: c.title,
          templateId: c.templateId,
        }
      }
    }

    const manifest = {
      v: 1 as const,
      kind: 'feedbackPack' as const,
      createdAt: Date.now(),
      payload: {
        coach: { id: coachId, name: coachName },
        student: { id: me.id, name: me.displayName },
        message: msg,
        clip: clipMeta ?? undefined,
      },
    }

    const pack = await createFeedbackPack({ manifest, clipUri })
    if (!pack) {
      Alert.alert(t('marketplace.shareUnavailableTitle'), t('marketplace.shareUnavailableBody'))
      return
    }
    await shareFile(pack.packUri, 'application/octet-stream')
    Alert.alert(t('marketplace.sharedPackTitle'), t('marketplace.sharedPackBody'))
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('marketplace.day')} {day}</Text>
        <Text preset="muted">{pd.title}</Text>
      </Box>

      <Card tone="glow">
        <Text preset="h2">{lesson ? lesson.title : t('marketplace.lessonTitle')}</Text>
        <Text preset="muted">{lesson ? lesson.body : t('marketplace.lessonMissing')}</Text>
      </Card>

      <Card>
        <Text preset="h2">{t('marketplace.feedbackTitle')}</Text>
        <Text preset="muted">{t('marketplace.feedbackSubtitle')}</Text>
        <Box style={{ marginTop: 10, gap: 10 }}>
          <Text preset="muted">{t('marketplace.coachCodeLabel')}</Text>
          <TextInput
            value={coachCode}
            onChangeText={setCoachCode}
            placeholder={t('marketplace.coachCodePlaceholder')}
            autoCapitalize="none"
            style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', color: 'white' }}
          />
          <Text preset="muted">{t('marketplace.messageLabel')}</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={t('marketplace.messagePlaceholder')}
            multiline
            style={{ minHeight: 90, padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', color: 'white' }}
          />

          <Text preset="muted">{t('marketplace.attachClipLabel')}</Text>
          <Card tone="default">
            <Text preset="muted">{t('marketplace.attachClipHint')}</Text>
            <Box style={{ marginTop: 10, gap: 10 }}>
              {clips.length ? (
                clips.slice(0, 8).map((c) => (
                  <Button
                    key={c.id}
                    text={`${selectedClipId === c.id ? '✅ ' : ''}${c.title}`}
                    variant={selectedClipId === c.id ? 'soft' : 'ghost'}
                    onPress={() => setSelectedClipId(c.id)}
                  />
                ))
              ) : (
                <Text preset="muted">{t('marketplace.noClipsYet')}</Text>
              )}
              {selectedClipId ? (
                <Button text={t('marketplace.clearClip')} variant="ghost" onPress={() => setSelectedClipId(null)} />
              ) : null}
            </Box>
          </Card>

          <Button text={t('marketplace.shareOfflinePack')} variant="soft" onPress={() => shareOfflinePack().catch((e) => Alert.alert(t('common.error'), e?.message ?? t('common.error')))} />
          <Button text={t('marketplace.sendFeedbackRequest')} variant="ghost" onPress={() => requestFeedback().catch((e) => Alert.alert(t('common.error'), e?.message ?? t('common.error')))} />
        </Box>
      </Card>

      <Box style={{ gap: 10 }}>
        <Button text={t('marketplace.markComplete')} onPress={() => complete().catch((e) => Alert.alert(t('common.error'), e?.message ?? t('common.error')))} />
        <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
      </Box>
    </Screen>
  )
}
