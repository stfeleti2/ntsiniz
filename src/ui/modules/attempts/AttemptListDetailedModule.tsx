import React from 'react'
import type { Attempt } from '@/core/storage/attemptsRepo'
import { AttemptListModule } from './AttemptListModule'

export type AttemptListDetailedModuleProps = {
  attempts: Attempt[]
  drillTitleById?: (drillId: string) => string
  getAudioUri?: (attempt: Attempt) => string | null | undefined
  testID?: string
}

export function AttemptListDetailedModule(props: AttemptListDetailedModuleProps) {
  return <AttemptListModule {...props} variant="detailed" />
}
