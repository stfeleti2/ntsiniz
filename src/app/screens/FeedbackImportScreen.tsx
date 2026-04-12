import React, { useState } from 'react'
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

import { importFeedbackPack } from '@/app/marketplace/feedbackPack'
import { createFeedbackRequest } from '@/core/marketplace/feedbackRepo'
import { ensureSelfPerson, upsertFriendPerson } from '@/core/social/peopleRepo'
import { createClip } from '@/core/performance/clipsRepo'
import { persistClipBase64 } from '@/core/performance/files'
import { getDb, exec } from '@/core/storage/db'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'FeedbackImport'>

export function FeedbackImportScreen({ navigation }: Props) {
  const snackbar = useSnackbar()
  const [busy, setBusy] = useState(false)

  const pick = async () => {
    if (busy) return
    setBusy(true)
    try {
      let DocumentPicker: any
      try {
        DocumentPicker = await import('expo-document-picker')
      } catch {
        Alert.alert(t('marketplace.importUnavailableTitle'), t('marketplace.importUnavailableBody'))
        return
      }

      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      })

      if (res?.canceled) return
      const file = res?.assets?.[0]
      if (!file?.uri) return

      const parsed = await importFeedbackPack({ fileUri: file.uri })
      if (!parsed) {
        Alert.alert(t('marketplace.importFailedTitle'), t('marketplace.importFailedBody'))
        return
      }

      const me = await ensureSelfPerson()

      // Only the target coach should import.
      if (parsed.manifest.payload.coach.id !== me.id) {
        Alert.alert(t('marketplace.importWrongCoachTitle'), t('marketplace.importWrongCoachBody'))
        return
      }

      // Add student as a friend so Following/leaderboards can work later.
      await upsertFriendPerson({
        id: parsed.manifest.payload.student.id,
        displayName: parsed.manifest.payload.student.name,
        avatarSeed: null,
        bio: null,
      }).catch(() => {})

      let clipId: string | null = null
      if (parsed.manifest.payload.clip && parsed.clipFileB64) {
        const tempClip = await createClip({
          userId: parsed.manifest.payload.student.id,
          displayName: parsed.manifest.payload.student.name,
          templateId: parsed.manifest.payload.clip.templateId ?? 'offline_feedback',
          title: parsed.manifest.payload.clip.title,
          durationMs: parsed.manifest.payload.clip.durationMs,
          videoUri: '', // set below
          thumbnailUri: null,
          score: parsed.manifest.payload.clip.score,
          metrics: {},
        })
        const stored = await persistClipBase64({ clipId: tempClip.id, base64: parsed.clipFileB64, ext: 'mp4' })
        // Update clip row with actual uri
        // Small direct SQL update to avoid widening clipsRepo API.
        const d = await getDb()
        await exec(d, `UPDATE clips SET videoUri = ?, updatedAt = ? WHERE id = ?;`, [stored, Date.now(), tempClip.id])
        clipId = tempClip.id
      }

      await createFeedbackRequest({
        coachId: parsed.manifest.payload.coach.id,
        coachName: parsed.manifest.payload.coach.name,
        studentId: parsed.manifest.payload.student.id,
        studentName: parsed.manifest.payload.student.name,
        clipId,
        message: parsed.manifest.payload.message,
      })

      snackbar.show(t('marketplace.importedOk'))
      navigation.replace('FeedbackInbox')
    } catch (e) {
      reportUiError(e)
      Alert.alert(t('marketplace.importFailedTitle'), t('marketplace.importFailedBody'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('marketplace.importFeedbackTitle')}</Text>
        <Text preset="muted">{t('marketplace.importFeedbackSubtitle')}</Text>
      </Box>

      <Card tone="glow">
        <Text preset="h2">{t('marketplace.importHowTitle')} vvv</Text>
        <Text preset="muted">{t('marketplace.importHowBody')}</Text>
        <Box style={{ marginTop: 12, gap: 10 }}>
          <Button text={busy ? t('common.loading') : t('marketplace.pickPack')} onPress={pick} disabled={busy} />
        </Box>
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
