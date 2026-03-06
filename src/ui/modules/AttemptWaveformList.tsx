import React from 'react'
import type { Attempt } from '@/core/storage/attemptsRepo'
import { AttemptListModule } from './attempts/AttemptListModule'

/**
 * Back-compat wrapper.
 * Prefer using AttemptListModule + AttemptRowModule.
 */
export function AttemptWaveformList({
  attempts,
  drillTitleById,
  getAudioUri,
  bestAttemptIdByDrillId,
  onOpenAttempt,
  testID,
}: {
  attempts: Attempt[]
  drillTitleById?: (drillId: string) => string
  getAudioUri?: (attempt: Attempt) => string | null | undefined
  bestAttemptIdByDrillId?: Record<string, string>
  onOpenAttempt?: (attempt: Attempt) => void
  testID?: string
}) {
  return (
    <AttemptListModule
      attempts={attempts}
      drillTitleById={drillTitleById}
      getAudioUri={getAudioUri}
      bestAttemptIdByDrillId={bestAttemptIdByDrillId}
      onOpenAttempt={onOpenAttempt}
      testID={testID}
    />
  )
}
