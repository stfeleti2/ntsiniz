import React, { useRef, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Alert } from 'react-native'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Input } from '@/ui/components/kit/Input'
import { Box } from '@/ui'
import { t } from '@/app/i18n'

import { ensureMicPermission, startMic } from '@/core/audio/micStream'
import { createAttemptWavRecorder } from '@/app/audio/attemptWavRecorder'
import { ensureSelfPerson } from '@/core/social/peopleRepo'
import { createDuetInvite } from '@/core/duets/duetsRepo'
import type { DuetInviteManifestV1 } from '@/core/duets/types'
import { createDuetInvitePack, shareFile } from '@/app/duets/duetPack'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'DuetCreate'>

export function DuetCreateScreen({ navigation }: Props) {
  const [title, setTitle] = useState('')
  const [recording, setRecording] = useState(false)
  const [partAUri, setPartAUri] = useState<string | null>(null)
  const [durationMs, setDurationMs] = useState<number>(0)
  const micRef = useRef<any>(null)
  const recorderRef = useRef<any>(null)

  const canSave = !!partAUri && durationMs > 1000

  const start = async () => {
    if (recording) return
    const ok = await ensureMicPermission()
    if (!ok) {
      Alert.alert(t('permissions.micRequiredTitle'), t('permissions.micRequiredBody'))
      return
    }
    setRecording(true)
    setPartAUri(null)
    setDurationMs(0)
    const recorder = createAttemptWavRecorder({ sampleRate: 44100, waveformBars: 72 })
    recorderRef.current = recorder
    micRef.current = await startMic(
      { sampleRate: 44100, frameDurationMs: 20 },
      (ev: any) => {
        const f = { pcmBase64: ev?.pcmBase64 } as any
        recorder.push(f)
      },
      (msg) => reportUiError(msg),
    )
  }

  const stop = async () => {
    if (!recording) return
    setRecording(false)
    try {
      await micRef.current?.stop?.()
    } catch {}
    micRef.current = null

    const audio = await recorderRef.current?.finalize?.().catch(() => null)
    recorderRef.current = null
    if (!audio) {
      Alert.alert(t('duets.recordFailedTitle'), t('duets.recordFailedBody'))
      return
    }
    setPartAUri(audio.uri)
    setDurationMs(audio.durationMs)
  }

  const createInviteAndShare = async () => {
    if (!canSave || !partAUri) return
    const me = await ensureSelfPerson()
    const safeTitle = (title || '').trim() || t('duets.defaultTitle')
    const duet = await createDuetInvite({
      inviterId: me.id,
      inviterName: me.displayName,
      title: safeTitle,
      sampleRate: 44100,
      durationMs,
      partAUri,
      expiresAt: Date.now() + 21 * 86400000, // 3 weeks
    })

    const manifest: DuetInviteManifestV1 = {
      v: 1,
      kind: 'duetInvite',
      inviteId: duet.inviteId,
      createdAt: duet.createdAt,
      expiresAt: duet.expiresAt ?? undefined,
      title: duet.title,
      inviter: { id: me.id, displayName: me.displayName, avatarSeed: me.avatarSeed ?? null },
      sampleRate: duet.sampleRate,
      durationMs: duet.durationMs,
      files: { partA: 'partA.wav' },
    }

    const pack = await createDuetInvitePack({ manifest, partAUri: duet.partAUri })
    if (!pack) {
      Alert.alert(t('duets.packFailedTitle'), t('duets.packFailedBody'))
      navigation.replace('DuetSession', { duetId: duet.id })
      return
    }

    await shareFile(pack.packUri, 'application/octet-stream')
    navigation.replace('DuetSession', { duetId: duet.id })
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('duets.createTitle')}</Text>
        <Text preset="muted">{t('duets.createSubtitle')}</Text>
      </Box>

      <Card tone="glow">
        <Text preset="h2">{t('duets.partATitle')}</Text>
        <Text preset="muted">{t('duets.partASubtitle')}</Text>
        <Box style={{ marginTop: 12, gap: 10 }}>
          <Input value={title} onChangeText={setTitle} label={t('duets.titleLabel')} placeholder={t('duets.titlePlaceholder')} />
          <Button text={recording ? t('duets.recording') : t('duets.recordPartA')} onPress={start} disabled={recording} />
          <Button text={t('duets.stop')} variant="soft" onPress={stop} disabled={!recording} />
          {partAUri ? <Text preset="muted">{t('duets.recordedLine', { sec: Math.max(1, Math.round(durationMs / 1000)) })}</Text> : null}
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('duets.shareInviteTitle')}</Text>
        <Text preset="muted">{t('duets.shareInviteSubtitle')}</Text>
        <Box style={{ marginTop: 12, gap: 10 }}>
          <Button text={t('duets.shareInvite')} disabled={!canSave} onPress={createInviteAndShare} />
          <Text preset="muted">{t('duets.headphonesHint')}</Text>
        </Box>
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
