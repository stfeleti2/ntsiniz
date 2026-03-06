import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Alert } from 'react-native'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { formatDate } from '@/core/i18n'
import { useSnackbar } from '@/ui/components/kit/Snackbar'

import { isCloudConfigured } from '@/core/cloud/config'
import { getIdentity } from '@/core/cloud/identityRepo'
import { signOutCloud, initCloudAuth } from '@/core/cloud/auth'
import { syncNow } from '@/core/cloud/syncEngine'
import { getSyncQueueSize } from '@/core/cloud/syncQueueRepo'
import { getSyncState } from '@/core/cloud/syncStateRepo'
import { ensureSelfPerson, updateSelfProfile } from '@/core/social/peopleRepo'
import { Input } from '@/ui/components/kit/Input'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'Account'>

export function AccountScreen({ navigation }: Props) {
  const snackbar = useSnackbar()
  const [configured, setConfigured] = useState(false)
  const [identity, setIdentity] = useState<any>(null)
  const [queue, setQueue] = useState(0)
  const [syncState, setSyncState] = useState<any>(null)
  const [me, setMe] = useState<any>(null)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')

  const refresh = async () => {
    setConfigured(isCloudConfigured())
    await initCloudAuth().catch(() => {})
    setIdentity(await getIdentity().catch(() => null))
    setQueue(await getSyncQueueSize().catch(() => 0))
    setSyncState(await getSyncState().catch(() => null))
    const m = await ensureSelfPerson()
    setMe(m)
    setName(m.displayName ?? '')
    setBio(m.bio ?? '')
  }

  useEffect(() => {
    refresh().catch((e) => reportUiError(e))
    const id = setInterval(() => refresh().catch(() => {}), 6000)
    return () => clearInterval(id)
  }, [])

  const signedIn = !!identity?.remoteUserId

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('account.title')}</Text>
        <Text preset="muted">{t('account.subtitle')}</Text>
      </Box>

      <Card tone={configured ? 'elevated' : 'warning'}>
        <Text preset="h2">{t('account.cloudTitle')}</Text>
        {configured ? (
          <Text preset="muted">{t('account.cloudConfigured')}</Text>
        ) : (
          <Text preset="muted">{t('account.cloudNotConfigured')}</Text>
        )}

        <Box style={{ marginTop: 12, gap: 10 }}>
          <Text preset="muted">{t('account.signedInAs', { value: signedIn ? (identity.email || identity.remoteUserId) : t('account.notSignedIn') })}</Text>
          <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <Button
              text={signedIn ? t('account.manage') : t('account.signIn')}
              onPress={() => navigation.navigate('SignIn')}
              disabled={!configured}
            />
            {signedIn ? (
              <Button
                text={t('account.signOut')}
                variant="ghost"
                onPress={() => {
                  Alert.alert(t('account.signOutTitle'), t('account.signOutBody'), [
                    { text: t('common.cancel'), style: 'cancel' },
                    {
                      text: t('account.signOutConfirm'),
                      style: 'destructive',
                      onPress: async () => {
                        await signOutCloud()
                        snackbar.show(t('account.signedOut'))
                        await refresh()
                      },
                    },
                  ])
                }}
              />
            ) : null}
          </Box>
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('account.profileTitle')}</Text>
        <Text preset="muted">{t('account.profileSubtitle')}</Text>
        <Box style={{ marginTop: 12, gap: 10 }}>
          <Input label={t('account.displayName')} value={name} onChangeText={setName} />
          <Input label={t('account.bio')} value={bio} onChangeText={setBio} placeholder={t('account.bioPlaceholder')} />
          <Button
            text={t('account.saveProfile')}
            onPress={async () => {
              await updateSelfProfile({ displayName: name.trim(), bio: bio.trim() || null })
              snackbar.show(t('account.saved'))
              await refresh()
            }}
          />
          {me ? <Text preset="muted">{t('account.yourId', { value: me.id })}</Text> : null}
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('account.syncTitle')}</Text>
        <Text preset="muted">{t('account.syncSubtitle')}</Text>
        <Box style={{ marginTop: 12, gap: 10 }}>
          <Text preset="muted">{t('account.queueSize', { value: queue })}</Text>
          <Text preset="muted">
            {t('account.lastSync', {
              value: syncState?.lastSyncAt ? formatDate(syncState.lastSyncAt, { dateStyle: 'medium', timeStyle: 'short' }) : t('account.never'),
            })}
          </Text>
          <Button
            text={t('account.syncNow')}
            disabled={!configured || !signedIn}
            onPress={async () => {
              const r = await syncNow().catch((e) => ({ ok: false, pushed: 0, pulled: 0, queueSize: queue, error: String(e?.message ?? e) }))
              if (!r.ok) snackbar.show(r.error ?? t('account.syncFailed'))
              else snackbar.show(t('account.syncOk', { pushed: r.pushed, pulled: r.pulled }))
              await refresh()
            }}
          />
          <Text preset="muted">{t('account.syncNote')}</Text>
        </Box>
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
