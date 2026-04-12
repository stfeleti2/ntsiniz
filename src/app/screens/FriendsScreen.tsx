import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Share } from 'react-native'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Input } from '@/ui/components/kit/Input'
import { ListRow } from '@/ui/components/kit/ListRow'
import { Box } from '@/ui'
import { useSnackbar } from '@/ui/components/kit/Snackbar'
import { t } from '@/app/i18n'

import { ensureSelfPerson, listFriends, setBlocked, updateSelfProfile } from '@/core/social/peopleRepo'
import { createMyProfileCode } from '@/core/social/shareCode'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'Friends'>

export function FriendsScreen({ navigation }: Props) {
  const snackbar = useSnackbar()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [friends, setFriends] = useState<any[]>([])

  const refresh = async () => {
    const me = await ensureSelfPerson()
    setName(me.displayName)
    setBio(me.bio ?? '')
    setFriends(await listFriends())
  }

  useEffect(() => {
    refresh().catch((e) => reportUiError(e))
  }, [])

  const shareMyProfile = async () => {
    const code = await createMyProfileCode()
    const link = `ntsiniz://import?code=${code}`
    await Share.share({ message: `${t('share.profileIntro')}\n${link}\n\n${t('share.codeFallback')}\n${code}` })
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('friends.title')}</Text>
        <Text preset="muted">{t('friends.subtitle')}</Text>
      </Box>

      <Card tone="glow">
        <Text preset="h2">{t('friends.profileTitle')}</Text>
        <Input value={name} onChangeText={setName} label={t('friends.nameLabel')} placeholder={t('friends.namePlaceholder')} />
        <Input value={bio} onChangeText={setBio} label={t('friends.bioLabel')} placeholder={t('friends.bioPlaceholder')} />
        <Box style={{ marginTop: 12, gap: 10 }}>
          <Button
            text={t('common.save')}
            onPress={async () => {
              try {
                await updateSelfProfile({ displayName: name, bio })
                snackbar.show(t('friends.saved'))
                await refresh()
              } catch (e: any) {
                snackbar.show(e?.message ?? t('common.error'))
              }
            }}
          />
          <Button text={t('friends.shareProfile')} variant="soft" onPress={shareMyProfile} />
          <Button text={t('friends.importCode')} variant="ghost" onPress={() => (navigation as any).navigate('ImportCode')} />
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('friends.listTitle')}</Text>
        <Text preset="muted">{t('friends.listSubtitle')}</Text>
        <Box style={{ marginTop: 10, gap: 10 }}>
          {friends.length ? (
            friends.map((f) => (
              <ListRow
                key={f.id}
                title={f.displayName}
                subtitle={f.isBlocked ? t('friends.blocked') : t('friends.friend')}
                leftIcon={f.isBlocked ? '⛔' : '👤'}
                onPress={async () => {
                  await setBlocked(f.id, !f.isBlocked)
                  await refresh()
                }}
              />
            ))
          ) : (
            <Text preset="muted">{t('friends.empty')}</Text>
          )}
        </Box>
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
