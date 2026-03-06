import React from 'react'
import { t } from '@/app/i18n'
import { ListRow } from '@/ui/components/kit/ListRow'

export type SessionRowData = {
  id: string
  startedAt: number
  avgScore: number
  attemptCount: number
}

export function SessionRowModule({
  session,
  onPress,
  testID,
}: {
  session: SessionRowData
  onPress?: () => void
  testID?: string
}) {
  const day = new Date(session.startedAt)
  const title = day.toLocaleDateString()
  const subtitle = t('journey.sessionRowSubtitle', { attempts: session.attemptCount, score: session.avgScore })

  return <ListRow title={title} subtitle={subtitle} onPress={onPress} testID={testID} />
}
