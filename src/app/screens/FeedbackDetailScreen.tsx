import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Alert, TextInput } from 'react-native'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { formatDate } from '@/core/i18n'
import { getFeedbackById, replyToFeedback } from '@/core/marketplace/feedbackRepo'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'FeedbackDetail'>

export function FeedbackDetailScreen({ navigation, route }: Props) {
  const { feedbackId } = route.params
  const [item, setItem] = useState<any | null>(null)
  const [response, setResponse] = useState<string>('')

  useEffect(() => {
    getFeedbackById(feedbackId)
      .then((f) => {
        setItem(f)
        setResponse(f?.response ?? '')
      })
      .catch((e) => reportUiError(e))
  }, [feedbackId])

  const save = async () => {
    if (!item) return
    const out = await replyToFeedback(item.id, response.trim())
    setItem(out)
    Alert.alert(t('marketplace.savedTitle'), t('marketplace.savedBody'))
  }

  if (!item) {
    return (
      <Screen scroll background="gradient">
        <Text preset="h1">{t('common.loading')}</Text>
      </Screen>
    )
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{item.studentName}</Text>
        <Text preset="muted">{formatDate(item.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</Text>
      </Box>

      <Card>
        <Text preset="h2">{t('marketplace.studentMessage')}</Text>
        <Text preset="muted">{item.message}</Text>
        {item.clipId ? (
          <Box style={{ marginTop: 10 }}>
            <Button text={t('marketplace.viewClip')} variant="soft" onPress={() => (navigation as any).navigate('PerformancePreview', { clipId: item.clipId })} />
          </Box>
        ) : null}
      </Card>

      <Card tone={item.status === 'done' ? 'glow' : 'default'}>
        <Text preset="h2">{t('marketplace.yourResponse')}</Text>
        <TextInput
          value={response}
          onChangeText={setResponse}
          placeholder={t('marketplace.responsePlaceholder')}
          multiline
          style={{ minHeight: 120, padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', color: 'white', marginTop: 10 }}
        />
        <Box style={{ marginTop: 10, gap: 10 }}>
          <Button text={t('marketplace.markDone')} onPress={() => save().catch((e) => Alert.alert(t('common.error'), e?.message ?? t('common.error')))} />
        </Box>
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
