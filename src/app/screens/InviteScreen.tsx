import React, { useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system/legacy'
import { fileStore } from '@/core/io/fileStore'
import { ensureAuthedIdentity } from '@/core/cloud/identityRepo'
import { useI18n } from '@/app/i18n/useI18n'
import { useAppNav } from '@/app/navigation/useAppNav'
import { getPublicLinks } from "@/core/config/links";
import { follow } from '@/core/social/followsRepo'
import { makeInviteCode, parseInviteCode } from '@/core/util/inviteCode'
import { reportUiError } from '@/app/telemetry/report'
import { Screen } from '@/ui/components/Screen'
import { Button, Card, EmptyState, ErrorState, Input, Skeleton } from '@/ui/components/kit'
import { Box } from '@/ui/primitives'
import { Text } from '@/ui/components/Typography'

type Identity = { userId: string; name: string }

export default function InviteScreen({ route }: any) {
  const { t } = useI18n()
  const nav = useAppNav()
  const links = useMemo(() => getPublicLinks(), []);
  const [me, setMe] = useState<Identity | null>(null)
  const [friendCode, setFriendCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [screenError, setScreenError] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)
  const [sharingBusy, setSharingBusy] = useState(false)
  const [applyingBusy, setApplyingBusy] = useState(false)

  async function loadIdentity() {
    setLoading(true)
    setScreenError(null)
    try {
      const id = await ensureAuthedIdentity()
      setMe({ userId: id.userId, name: id.displayName })
    } catch (e) {
      reportUiError(e, { kind: 'invite_identity' })
      setScreenError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadIdentity()
  }, [])

  useEffect(() => {
    const code = route?.params?.code
    if (code && typeof code === 'string') setFriendCode(code)
  }, [route?.params?.code])

  const myCode = useMemo(() => (me ? makeInviteCode(me.userId) : t('common.ellipsis')), [me, t])
  const shareText = useMemo(() => {
    const link = `${links.inviteUrlBase}?code=${encodeURIComponent(myCode)}`
    return t('invite.shareText', { code: myCode, link })
  }, [myCode, t, links.inviteUrlBase])

  async function shareInvite() {
    if (!me) return
    setSharingBusy(true)
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(t('invite.title'), t('common.share'))
        setSuccessNotice(t('common.share'))
        return
      }
      // expo-sharing shares a file; we write a tiny text payload.
      const uri = `${FileSystem.cacheDirectory}ntsiniz-invite.txt`
      await fileStore.writeText(uri, shareText)
      await Sharing.shareAsync(uri, { mimeType: 'text/plain', dialogTitle: 'Invite' })
      setSuccessNotice(t('common.share'))
    } catch (e) {
      reportUiError(e, { kind: 'invite_share' })
      setScreenError(t('common.error'))
    } finally {
      setSharingBusy(false)
    }
  }

  async function copyOwnCode() {
    if (!me) return
    setSharingBusy(true)
    try {
      const uri = `${FileSystem.cacheDirectory}ntsiniz-invite-code.txt`
      await fileStore.writeText(uri, myCode)
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'text/plain' })
      } else {
        Alert.alert(t('invite.title'), myCode)
      }
      setSuccessNotice(t('common.copy'))
    } catch (e) {
      reportUiError(e, { kind: 'invite_copy_share' })
      setScreenError(t('common.error'))
    } finally {
      setSharingBusy(false)
    }
  }

  async function applyFriendCode() {
    if (!me) return
    const parsed = parseInviteCode(friendCode)
    if (!parsed) {
      setScreenError(t('invite.invalid'))
      return
    }
    setApplyingBusy(true)
    try {
      await follow(me.userId, parsed.userId)
      setSuccessNotice(t('invite.applied'))
      setScreenError(null)
      setFriendCode('')
    } catch (e) {
      reportUiError(e, { kind: 'invite_apply' })
      setScreenError(t('common.error'))
    } finally {
      setApplyingBusy(false)
    }
  }

  return (
    <Screen
      scroll
      background="gradient"
      title={t('invite.title')}
      subtitle={t('invite.subtitle')}
      onBack={() => nav.goBack()}
    >
      {loading ? (
        <Card tone="elevated">
          <Box style={{ gap: 10 }}>
            <Skeleton height={16} width="40%" />
            <Skeleton height={24} width="55%" />
            <Skeleton height={44} width="100%" />
          </Box>
        </Card>
      ) : null}

      {!loading && screenError ? (
        <ErrorState title={t('invite.title')} message={screenError} onRetry={() => void loadIdentity()} />
      ) : null}

      {!loading && !screenError && !me ? (
        <EmptyState title={t('invite.title')} message={t('invite.note')} />
      ) : null}

      {!loading && !screenError && me ? (
        <Box style={{ gap: 12 }}>
          {successNotice ? (
            <Card tone="glow">
              <Text preset="body">{successNotice}</Text>
            </Card>
          ) : null}

          <Card tone="elevated">
            <Box style={{ gap: 6 }}>
              <Text preset="muted">{t('invite.yourCode')}</Text>
              <Text preset="h2">{myCode}</Text>
            </Box>

            <Box style={{ flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <Button text={sharingBusy ? t('common.ellipsis') : t('invite.share')} onPress={() => void shareInvite()} disabled={sharingBusy} />
              <Button text={t('common.copy')} variant="ghost" onPress={() => void copyOwnCode()} disabled={sharingBusy} />
            </Box>
          </Card>

          <Card>
            <Box style={{ gap: 10 }}>
              <Text preset="muted">{t('invite.paste')}</Text>
              <Input
                value={friendCode}
                onChangeText={setFriendCode}
                placeholder={t('invite.placeholder')}
                autoCapitalize="characters"
              />
              <Button
                text={applyingBusy ? t('common.ellipsis') : t('invite.apply')}
                onPress={() => void applyFriendCode()}
                disabled={!friendCode.trim() || applyingBusy}
              />
              <Text preset="caption">{t('invite.note')}</Text>
            </Box>
          </Card>
        </Box>
      ) : null}
    </Screen>
  )
}
