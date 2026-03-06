import React, { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/Card'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { ListRow } from '@/ui/components/kit/ListRow'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { ensureSelfPerson } from '@/core/social/peopleRepo'
import { listFeedbackForCoach } from '@/core/marketplace/feedbackRepo'
import { reportUiError } from '@/app/telemetry/report'

type Props = NativeStackScreenProps<RootStackParamList, 'FeedbackInbox'>

export function FeedbackInboxScreen({ navigation }: Props) {
  const [items, setItems] = useState<any[]>([])

  const refresh = async () => {
    const me = await ensureSelfPerson()
    setItems(await listFeedbackForCoach(me.id))
  }

  useEffect(() => {
    refresh().catch((e) => reportUiError(e))
  }, [])

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{t('marketplace.feedbackInboxTitle')}</Text>
        <Text preset="muted">{t('marketplace.feedbackInboxSubtitle')}</Text>
      </Box>

      <Card>
        <Box style={{ marginTop: 6, gap: 10 }}>
          {items.length ? (
            items.map((f) => (
              <ListRow
                key={f.id}
                title={`${f.studentName}`}
                subtitle={`${f.status === 'open' ? t('marketplace.feedbackOpen') : t('marketplace.feedbackDone')} · ${new Date(f.createdAt).toLocaleDateString()}`}
                leftIcon={f.status === 'open' ? '📩' : '✅'}
                onPress={() => (navigation as any).navigate('FeedbackDetail', { feedbackId: f.id })}
              />
            ))
          ) : (
            <Text preset="muted">{t('marketplace.feedbackEmpty')}</Text>
          )}
        </Box>
      </Card>

      <Box style={{ gap: 10 }}>
        <Button text={t('marketplace.refresh')} variant="soft" onPress={() => refresh().catch(() => {})} />
        <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
      </Box>
    </Screen>
  )
}
