import React from 'react'
import { Badge } from '../components/kit/Badge'
import { t } from '@/app/i18n'

export function TakeBadge({ status, testID }: { status: 'best' | 'saved' | 'new'; testID?: string }) {
  const label = status === 'best' ? t('common.bestTake') : status === 'saved' ? t('common.saved') : t('common.new')
  const tone = status === 'best' ? 'success' : status === 'saved' ? 'default' : 'warning'
  return <Badge testID={testID} label={label} tone={tone} />
}
