import React, { useMemo } from 'react'
import type { Attempt } from '@/core/storage/attemptsRepo'
import { Box, Text } from '@/ui/primitives'
import { t } from '@/app/i18n'
import { useDevModuleEnabled } from '../devModules'
import { AttemptRowModule } from './AttemptRowModule'
import { AttemptRowCompactModule } from './AttemptRowCompactModule'

type Props = {
  attempts: Attempt[]
  drillTitleById?: (drillId: string) => string
  /** Optional resolver for dev-only playback wiring. */
  getAudioUri?: (attempt: Attempt) => string | null | undefined
  /** Optional mapping of drillId -> best attemptId for this list context. */
  bestAttemptIdByDrillId?: Record<string, string>
  /** Optional callback to open a full Playback screen for a specific attempt. */
  onOpenAttempt?: (attempt: Attempt) => void
  variant?: 'detailed' | 'compact'
  testID?: string
}

/**
 * UI-only module.
 * Turns raw attempts into a consistent, shareable list layout.
 */
export function AttemptListModule({ attempts, drillTitleById, getAudioUri, bestAttemptIdByDrillId, onOpenAttempt, variant = 'detailed', testID }: Props) {
  const livePlayback = useDevModuleEnabled('pattern.playbackOverlay.live')

  const bestByDrill = useMemo(() => {
    const map: Record<string, { id: string; score: number }> = {}
    for (const a of attempts) {
      const cur = map[a.drillId]
      if (!cur || a.score >= cur.score) map[a.drillId] = { id: a.id, score: a.score }
    }
    const out: Record<string, string> = {}
    for (const k of Object.keys(map)) out[k] = map[k].id
    return bestAttemptIdByDrillId ? { ...out, ...bestAttemptIdByDrillId } : out
  }, [attempts, bestAttemptIdByDrillId])

  if (!attempts.length) {
    return (
      <Box testID={testID}>
        <Text tone="muted">{t('results.noAttempts')}</Text>
      </Box>
    )
  }

  return (
    <Box testID={testID} style={{ gap: 10 }}>
      {attempts.map((a, idx) => (
        variant === 'compact' ? (
          <AttemptRowCompactModule
            key={a.id}
            attempt={a}
            index={idx}
            isBest={bestByDrill[a.drillId] === a.id}
            drillTitleById={drillTitleById}
            parentTestID={testID}
          />
        ) : (
          <AttemptRowModule
            key={a.id}
            attempt={a}
            index={idx}
            isBest={bestByDrill[a.drillId] === a.id}
            drillTitleById={drillTitleById}
            livePlayback={livePlayback}
            getAudioUri={getAudioUri}
            onOpenAttempt={onOpenAttempt}
            parentTestID={testID}
            showDivider={idx < attempts.length - 1}
          />
        )
      ))}
    </Box>
  )
}
