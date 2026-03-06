import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, Pressable, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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

export default function InviteScreen({ route }: any) {
  const { t } = useI18n()
  const nav = useAppNav()
  const links = useMemo(() => getPublicLinks(), []);
  const [me, setMe] = useState<{ userId: string; name: string } | null>(null)
  const [friendCode, setFriendCode] = useState('')

  useEffect(() => {
    ;(async () => {
      const id = await ensureAuthedIdentity()
      setMe({ userId: id.userId, name: id.displayName })
    })()
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
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(t('invite.title'), t('common.share'))
        return
      }
      // expo-sharing shares a file; we write a tiny text payload.
      const uri = `${FileSystem.cacheDirectory}ntsiniz-invite.txt`
      await fileStore.writeText(uri, shareText)
      await Sharing.shareAsync(uri, { mimeType: 'text/plain', dialogTitle: 'Invite' })
    } catch (e) {
      reportUiError(e, { kind: 'invite_share' })
    }
  }

  async function applyFriendCode() {
    if (!me) return
    const parsed = parseInviteCode(friendCode)
    if (!parsed) {
      Alert.alert(t('invite.title'), t('invite.invalid'))
      return
    }
    try {
      await follow(me.userId, parsed.userId)
      Alert.alert(t('invite.title'), t('invite.applied'))
      setFriendCode('')
    } catch (e) {
      reportUiError(e, { kind: 'invite_apply' })
      Alert.alert(t('invite.title'), t('common.error'))
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B10' }}>
      <View style={{ padding: 16, gap: 12 }}>
        <Pressable onPress={() => nav.goBack()} style={{ paddingVertical: 6 }}>
          <Text style={{ color: '#9AA4B2' }}>{t('common.back')}</Text>
        </Pressable>

        <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>{t('invite.title')}</Text>
        <Text style={{ color: '#9AA4B2' }}>{t('invite.subtitle')}</Text>

        <View style={{ backgroundColor: '#121826', borderRadius: 16, padding: 14 }}>
          <Text style={{ color: '#9AA4B2', fontSize: 12 }}>{t('invite.yourCode')}</Text>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: '800', marginTop: 6 }}>{myCode}</Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Pressable onPress={shareInvite} style={{ backgroundColor: '#2D6CDF', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 }}>
              <Text style={{ color: 'white', fontWeight: '800' }}>{t('invite.share')}</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                try {
                  const uri = `${FileSystem.cacheDirectory}ntsiniz-invite-code.txt`
                  await fileStore.writeText(uri, myCode)
                  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'text/plain' })
                  else Alert.alert(t('invite.title'), myCode)
                } catch (e) {
                  reportUiError(e, { kind: 'invite_copy_share' })
                  Alert.alert(t('invite.title'), myCode)
                }
              }}
              style={{ backgroundColor: '#1C2330', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 }}
            >
              <Text style={{ color: 'white', fontWeight: '800' }}>{t('common.copy')}</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ backgroundColor: '#121826', borderRadius: 16, padding: 14 }}>
          <Text style={{ color: '#9AA4B2', fontSize: 12 }}>{t('invite.paste')}</Text>
          <TextInput
            value={friendCode}
            onChangeText={setFriendCode}
            placeholder={t('invite.placeholder')}
            placeholderTextColor="#4B5565"
            autoCapitalize="characters"
            style={{ color: 'white', marginTop: 8, borderWidth: 1, borderColor: '#1F2A3A', borderRadius: 12, padding: 10 }}
          />
          <Pressable onPress={applyFriendCode} style={{ marginTop: 10, backgroundColor: '#1C2330', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 }}>
            <Text style={{ color: 'white', fontWeight: '800' }}>{t('invite.apply')}</Text>
          </Pressable>
          <Text style={{ color: '#9AA4B2', fontSize: 12, marginTop: 10 }}>{t('invite.note')}</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
