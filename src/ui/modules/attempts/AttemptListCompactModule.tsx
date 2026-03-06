import React from 'react'
import type { Attempt } from '@/core/storage/attemptsRepo'
import { AttemptListModule } from './AttemptListModule'

export type AttemptListCompactModuleProps = {
  attempts: Attempt[]
  drillTitleById?: (drillId: string) => string
  testID?: string
}

export function AttemptListCompactModule(props: AttemptListCompactModuleProps) {
  return <AttemptListModule {...props} variant="compact" />
}
