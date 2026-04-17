import React, { useEffect, useRef, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Alert } from 'react-native'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { useSnackbar } from '@/ui/components/kit/Snackbar'

import { getDuetById, setDuetMix, setDuetPartB } from '@/core/duets/duetsRepo'
import { ensureMicPermission, startMic } from '@/core/audio/micStream'
import { createAttemptWavRecorder } from '@/app/audio/attemptWavRecorder'
import { getDuetInviteDir, createDuetInvitePack, shareFile } from '@/app/duets/duetPack'
import type { DuetInviteManifestV1 } from '@/core/duets/types'
import { ensureSelfPerson } from '@/core/social/peopleRepo'
import { createPost } from '@/core/social/postsRepo'
import { mixWav16MonoFiles } from '@/app/audio/wavMix'
import { useSoundPlayback } from '@/app/audio/useSoundPlayback'
import { reportUiError } from '@/app/telemetry/report'
import { fileStore } from '@/core/io/fileStore'

type Props = NativeStackScreenProps<RootStackParamList, 'DuetSession'>

export function DuetSessionScreen({ navigation, route }: Props) {
  const snackbar = useSnackbar()
  const duetId = route.params.duetId
  const [duet, setDuet] = useState<any | null>(null)
  const [busy, setBusy] = useState(false)
  const [recording, setRecording] = useState(false)
  const micRef = useRef<any>(null)
  const recorderRef = useRef<any>(null)

  const refresh = async () => {
    const d = await getDuetById(duetId)
    setDuet(d)
  }

  useEffect(() => {
    refresh().catch((e) => reportUiError(e))
  }, [duetId])

  const partA = useSoundPlayback(duet?.partAUri)
  const partB = useSoundPlayback(duet?.partBUri)
  const mix = useSoundPlayback(duet?.mixUri)

  const canRecordB = !!duet?.partAUri && !recording
  const canMix = !!duet?.partAUri && !!duet?.partBUri && !busy

  const recordPartB = async () => {
    if (!duet) return
    if (recording) return
    const ok = await ensureMicPermission()
    if (!ok) {
      Alert.alert(t('permissions.micRequiredTitle'), t('permissions.micRequiredBody'))
      return
    }

    // Encourage headphones for clean separation.
    Alert.alert(t('duets.headphonesTitle'), t('duets.headphonesBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('duets.startRecording'),
        onPress: async () => {
          setRecording(true)
          try {
            // best-effort: rewind Part A and play as a guide
            await partA.seekToMs(0).catch(() => {})
            await partA.toggle().catch(() => {})
          } catch {}

          const rec = createAttemptWavRecorder({ sampleRate: duet.sampleRate ?? 44100, waveformBars: 72 })
          recorderRef.current = rec
          micRef.current = await startMic(
            { sampleRate: duet.sampleRate ?? 44100, frameDurationMs: 20 },
            (ev: any) => rec.push({ pcmBase64: ev?.pcmBase64 } as any),
            (msg) => reportUiError(msg),
          )
        },
      },
    ])
  }

  const stopRecording = async () => {
    if (!recording) return
    setRecording(false)
    try {
      await micRef.current?.stop?.()
    } catch {}
    micRef.current = null
    try {
      // stop guide audio
      if (partA.isPlaying) await partA.toggle().catch(() => {})
    } catch {}

    const audio = await recorderRef.current?.finalize?.().catch(() => null)
    recorderRef.current = null
    if (!audio || !duet) {
      Alert.alert(t('duets.recordFailedTitle'), t('duets.recordFailedBody'))
      return
    }

    let FileSystem: any
    try {
      FileSystem = await import('expo-file-system/legacy')
    } catch {
      return
    }

    const dir = await getDuetInviteDir(duet.inviteId)
    if (!dir) return
    const target = `${dir}/partB.wav`
    // copy from cache to persisted dir
    await FileSystem.copyAsync({ from: audio.uri, to: target }).catch(async () => {
      // fallback: re-write base64
      const b64 = await fileStore.readBase64(audio.uri)
      await fileStore.writeBase64(target, b64)
    })

    await setDuetPartB({ duetId: duet.id, partBUri: target, durationMs: Math.max(duet.durationMs || 0, audio.durationMs || 0) })
    snackbar.show(t('duets.partBRecorded'))
    await refresh()
  }

  const mixNow = async () => {
    if (!duet) return
    if (!duet.partAUri || !duet.partBUri) return
    if (busy) return
    setBusy(true)
    try {
      let FileSystem: any
      try {
        FileSystem = await import('expo-file-system/legacy')
      } catch {
        return
      }
      const dir = await getDuetInviteDir(duet.inviteId)
      if (!dir) return
      const outUri = `${dir}/mix.wav`
      // Ensure file is overwritten safely.
      await FileSystem.deleteAsync(outUri, { idempotent: true }).catch(() => {})
      const res = await mixWav16MonoFiles({ aUri: duet.partAUri, bUri: duet.partBUri, outUri, gainA: 0.75, gainB: 0.75 })
      if (!res) {
        Alert.alert(t('duets.mixFailedTitle'), t('duets.mixFailedBody'))
        return
      }
      await setDuetMix({ duetId: duet.id, mixUri: res.outUri, durationMs: res.durationMs })
      snackbar.show(t('duets.mixedOk'))
      await refresh()
    } catch (e) {
      reportUiError(e)
      Alert.alert(t('duets.mixFailedTitle'), t('duets.mixFailedBody'))
    } finally {
      setBusy(false)
    }
  }

  const shareInvite = async () => {
    if (!duet) return
    const me = await ensureSelfPerson()
    const manifest: DuetInviteManifestV1 = {
      v: 1,
      kind: 'duetInvite',
      inviteId: duet.inviteId,
      createdAt: duet.createdAt,
      expiresAt: duet.expiresAt ?? undefined,
      title: duet.title,
      inviter: { id: duet.inviterId, displayName: duet.inviterName, avatarSeed: me.avatarSeed ?? null },
      sampleRate: duet.sampleRate,
      durationMs: duet.durationMs,
      files: { partA: 'partA.wav' },
    }
    const pack = await createDuetInvitePack({ manifest, partAUri: duet.partAUri })
    if (!pack) {
      Alert.alert(t('duets.packFailedTitle'), t('duets.packFailedBody'))
      return
    }
    await shareFile(pack.packUri, 'application/octet-stream')
  }

  const shareMix = async () => {
    if (!duet?.mixUri) return
    await shareFile(duet.mixUri, 'audio/wav')
  }

  const postToCommunity = async () => {
    if (!duet) return
    try {
      const me = await ensureSelfPerson()
      await createPost({
        authorId: me.id,
        authorName: me.displayName,
        type: 'duet',
        title: t('duets.postTitle', { title: duet.title }),
        body: t('duets.postBody', { inviter: duet.inviterName }),
        payload: {
          duetId: duet.id,
          inviteId: duet.inviteId,
          status: duet.status,
          mixUri: duet.mixUri ?? null,
        },
        source: 'self',
        expiresAt: null,
      } as any)
      snackbar.show(t('duets.posted'))
      ;(navigation as any).navigate('MainTabs', { screen: 'Community' })
    } catch (e) {
      reportUiError(e)
      Alert.alert(t('duets.postFailedTitle'), t('duets.postFailedBody'))
    }
  }

  if (!duet) {
    return (
      <Screen scroll background="gradient">
        <Text preset="h1">{t('common.loading')}</Text>
        <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
      </Screen>
    )
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{duet.title}</Text>
        <Text preset="muted">{t('duets.sessionSubtitle', { name: duet.inviterName })}</Text>
      </Box>

      <Card tone="glow">
        <Text preset="h2">{t('duets.partAPlayTitle')}</Text>
        <Text preset="muted">{t('duets.partAPlaySubtitle')}</Text>
        <Box style={{ marginTop: 12, gap: 10 }}>
          <Button text={partA.isPlaying ? t('duets.pause') : t('duets.play')} variant="soft" onPress={() => partA.toggle()} disabled={!partA.isReady} />
          <Text preset="muted">{partA.progressLabel}</Text>
          {duet.role === 'inviter' ? <Button text={t('duets.shareInviteAgain')} variant="ghost" onPress={shareInvite} /> : null}
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('duets.partBTitle')}</Text>
        <Text preset="muted">{duet.partBUri ? t('duets.partBReady') : t('duets.partBMissing')}</Text>
        <Box style={{ marginTop: 12, gap: 10 }}>
          <Button text={recording ? t('duets.recording') : t('duets.recordPartB')} onPress={recordPartB} disabled={!canRecordB} />
          <Button text={t('duets.stop')} variant="soft" onPress={stopRecording} disabled={!recording} />
          {duet.partBUri ? (
            <>
              <Button text={partB.isPlaying ? t('duets.pause') : t('duets.playPartB')} variant="ghost" onPress={() => partB.toggle()} disabled={!partB.isReady} />
              <Text preset="muted">{partB.progressLabel}</Text>
            </>
          ) : null}
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('duets.mixTitle')}</Text>
        <Text preset="muted">{t('duets.mixSubtitle')}</Text>
        <Box style={{ marginTop: 12, gap: 10 }}>
          <Button text={busy ? t('common.loading') : t('duets.mixNow')} onPress={mixNow} disabled={!canMix} />
          {duet.mixUri ? (
            <>
              <Button text={mix.isPlaying ? t('duets.pause') : t('duets.playMix')} variant="soft" onPress={() => mix.toggle()} disabled={!mix.isReady} />
              <Text preset="muted">{mix.progressLabel}</Text>
              <Button text={t('duets.shareMix')} variant="ghost" onPress={shareMix} />
              <Button text={t('duets.postToCommunity')} variant="soft" onPress={postToCommunity} />
            </>
          ) : (
            <Text preset="muted">{t('duets.mixNotReady')}</Text>
          )}
        </Box>
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
