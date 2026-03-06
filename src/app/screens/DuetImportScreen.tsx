import React, { useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Alert } from 'react-native'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { useSnackbar } from '@/ui/components/kit/Snackbar'

import { importDuetInvitePack } from '@/app/duets/duetPack'
import { getDuetByInviteId, upsertImportedDuetInvite } from '@/core/duets/duetsRepo'
import { upsertFriendPerson } from '@/core/social/peopleRepo'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'DuetImport'>

export function DuetImportScreen({ navigation }: Props) {
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
        Alert.alert(t('duets.importUnavailableTitle'), t('duets.importUnavailableBody'))
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

      const parsed = await importDuetInvitePack({ fileUri: file.uri })
      if (!parsed) {
        Alert.alert(t('duets.importFailedTitle'), t('duets.importFailedBody'))
        return
      }

      // De-dupe
      const existing = await getDuetByInviteId(parsed.manifest.inviteId)
      if (existing) {
        snackbar.show(t('duets.importedAlready'))
        navigation.replace('DuetSession', { duetId: existing.id })
        return
      }

      // Add inviter as a friend for later follow/leaderboards.
      await upsertFriendPerson({
        id: parsed.manifest.inviter.id,
        displayName: parsed.manifest.inviter.displayName,
        avatarSeed: parsed.manifest.inviter.avatarSeed ?? null,
        bio: null,
      }).catch(() => {})

      const duet = await upsertImportedDuetInvite({
        inviteId: parsed.manifest.inviteId,
        inviterId: parsed.manifest.inviter.id,
        inviterName: parsed.manifest.inviter.displayName,
        title: parsed.manifest.title,
        sampleRate: parsed.manifest.sampleRate,
        durationMs: parsed.manifest.durationMs,
        partAUri: parsed.storedPartAUri,
        expiresAt: parsed.manifest.expiresAt ?? null,
      })

      snackbar.show(t('duets.importedOk'))
      navigation.replace('DuetSession', { duetId: duet.id })
    } catch (e) {
      reportUiError(e)
      Alert.alert(t('duets.importFailedTitle'), t('duets.importFailedBody'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('duets.importTitle')}</Text>
        <Text preset="muted">{t('duets.importSubtitle')}</Text>
      </Box>

      <Card tone="glow">
        <Text preset="h2">{t('duets.importHowTitle')}</Text>
        <Text preset="muted">{t('duets.importHowBody')}</Text>
        <Box style={{ marginTop: 12, gap: 10 }}>
          <Button text={busy ? t('common.loading') : t('duets.pickFile')} onPress={pick} disabled={busy} />
        </Box>
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
