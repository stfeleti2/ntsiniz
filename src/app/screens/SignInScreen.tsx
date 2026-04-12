import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Input } from '@/ui/components/kit/Input'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { logger } from '@/core/observability/logger'
import { useSnackbar } from '@/ui/components/kit/Snackbar'

import { isCloudConfigured } from '@/core/cloud/config'
import { getIdentity } from '@/core/cloud/identityRepo'
import { initCloudAuth, requestEmailOtp, verifyEmailOtp } from '@/core/cloud/auth'


type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>

export function SignInScreen({ navigation }: Props) {
  const snackbar = useSnackbar()
  const [configured, setConfigured] = useState(false)
  const [identity, setIdentity] = useState<any>(null)
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  const refresh = async () => {
    setConfigured(isCloudConfigured())
    await initCloudAuth().catch((e) => logger.warn('initCloudAuth failed', e))
    const id = await getIdentity().catch(() => null)
    setIdentity(id)
    if (id?.email && !email) setEmail(id.email)
  }

  useEffect(() => {
    refresh().catch((e) => logger.warn('cloud refresh failed', e))
  }, [])

  const signedIn = !!identity?.remoteUserId

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('signin.title')}</Text>
        <Text preset="muted">{t('signin.subtitle')}</Text>
      </Box>

      {!configured ? (
        <Card tone="warning">
          <Text preset="h2">{t('signin.notConfiguredTitle')}</Text>
          <Text preset="muted">{t('signin.notConfiguredBody')}</Text>
        </Card>
      ) : null}

      {signedIn ? (
        <Card tone="glow">
          <Text preset="h2">{t('signin.alreadyTitle')}</Text>
          <Text preset="muted">{t('signin.alreadyBody', { value: identity.email || identity.remoteUserId })}</Text>
          <Button text={t('signin.backToAccount')} onPress={() => navigation.replace('Account')} />
        </Card>
      ) : (
        <Card>
          <Text preset="h2">{step === 'email' ? t('signin.emailStepTitle') : t('signin.codeStepTitle')}</Text>
          <Text preset="muted">{step === 'email' ? t('signin.emailStepBody') : t('signin.codeStepBody')}</Text>

          <Box style={{ marginTop: 12, gap: 10 }}>
            <Input label={t('signin.emailLabel')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            {step === 'code' ? (
              <Input label={t('signin.codeLabel')} value={code} onChangeText={setCode} keyboardType="number-pad" />
            ) : null}

            {step === 'email' ? (
              <Button
                text={busy ? t('signin.sending') : t('signin.sendCode')}
                disabled={!configured || busy || !email.trim()}
                onPress={async () => {
                  try {
                    setBusy(true)
                    await requestEmailOtp(email)
                    snackbar.show(t('signin.sent'))
                    setStep('code')
                  } catch (e: any) {
                    snackbar.show(e?.message ?? t('signin.failed'))
                  } finally {
                    setBusy(false)
                  }
                }}
              />
            ) : (
              <Button
                text={busy ? t('signin.verifying') : t('signin.verify')}
                disabled={!configured || busy || !code.trim()}
                onPress={async () => {
                  try {
                    setBusy(true)
                    await verifyEmailOtp(email, code)
                    snackbar.show(t('signin.ok'))
                    await refresh()
                    navigation.replace('Account')
                  } catch (e: any) {
                    snackbar.show(e?.message ?? t('signin.failed'))
                  } finally {
                    setBusy(false)
                  }
                }}
              />
            )}

            {step === 'code' ? (
              <Button
                text={t('signin.resend')}
                variant="ghost"
                disabled={busy}
                onPress={async () => {
                  try {
                    setBusy(true)
                    await requestEmailOtp(email)
                    snackbar.show(t('signin.sent'))
                  } catch (e: any) {
                    snackbar.show(e?.message ?? t('signin.failed'))
                  } finally {
                    setBusy(false)
                  }
                }}
              />
            ) : null}
          </Box>
        </Card>
      )}

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
