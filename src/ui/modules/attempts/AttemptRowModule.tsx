import React from 'react'
import type { Attempt } from '@/core/storage/attemptsRepo'
import { Box, Text, Divider } from '@/ui/primitives'
import { WaveformCard, TakeBadge, PlaybackOverlay, WaveformSeek, WaveformSkeleton } from '@/ui/patterns'
import { t } from '@/app/i18n'
import { useSoundPlayback } from '@/app/audio/useSoundPlayback'
import { useWaveformData } from '@/app/audio/useWaveformData'
import { IconButton } from '@/ui/components/kit'

type Props = {
  attempt: Attempt
  index: number
  isBest: boolean
  drillTitleById?: (drillId: string) => string
  /** Dev-only: enable actual playback wiring when a URI is provided. */
  livePlayback: boolean
  getAudioUri?: (attempt: Attempt) => string | null | undefined
  onOpenAttempt?: (attempt: Attempt) => void
  parentTestID?: string
  showDivider: boolean
}

/**
 * UI-only row module for an Attempt.
 * Can optionally wire PlaybackOverlay in dev if a URI is provided.
 */
export function AttemptRowModule({
  attempt,
  index,
  isBest,
  drillTitleById,
  livePlayback,
  getAudioUri,
  onOpenAttempt,
  parentTestID,
  showDivider,
}: Props) {
  const title = drillTitleById ? drillTitleById(attempt.drillId) : attempt.drillId
  const scoreLabel = t('results.scoreChip', { score: Math.round(attempt.score) })
  const dateLabel = new Date(attempt.createdAt).toLocaleDateString()

  const metricsUri = (attempt as any)?.metrics?.audioUri as string | undefined
  const resolvedUri = (getAudioUri ? getAudioUri(attempt) : metricsUri) ?? null
  const uri = resolvedUri && (livePlayback || !!metricsUri) ? resolvedUri : metricsUri ?? null
  const pb = useSoundPlayback(uri)

  const wf = useWaveformData({ uri, metrics: (attempt as any)?.metrics, bars: 72 })
  const peaks = wf.data?.waveformPeaks ?? []
  const canSeek = !!uri && pb.isReady && typeof pb.seekToProgress === 'function'

  return (
    <Box>
      <WaveformCard
        testID={parentTestID ? `${parentTestID}.item.${index}` : undefined}
        title={title}
        subtitle={t('results.attemptMeta', { date: dateLabel })}
        statusLabel={scoreLabel}
        rightSlot={
          <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {isBest ? <TakeBadge status="best" /> : null}
            {onOpenAttempt ? (
              <IconButton
                icon="open"
                accessibilityLabel={t('results.openPlayback')}
                onPress={() => onOpenAttempt(attempt)}
                testID={parentTestID ? `${parentTestID}.item.${index}.open` : undefined}
                size={36}
              />
            ) : null}
          </Box>
        }
        contentHeight={110}
      >
        {uri ? (
          wf.loading && !peaks.length ? (
            <WaveformSkeleton
              bars={72}
              height={82}
              testID={parentTestID ? `${parentTestID}.item.${index}.waveform.loading` : undefined}
              style={{ marginTop: 2 }}
            />
          ) : (
            <WaveformSeek
              peaks={peaks}
              progress={pb.progress}
              onSeek={canSeek ? pb.seekToProgress : undefined}
              disabled={!canSeek}
              testID={parentTestID ? `${parentTestID}.item.${index}.waveform` : undefined}
              height={82}
              style={{ marginTop: 2 }}
            />
          )
        ) : (
          <Box style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <Text tone="muted" size="sm">
              {t('results.noAudio')}
            </Text>
          </Box>
        )}
        <PlaybackOverlay
          isPlaying={uri ? pb.isPlaying : false}
          progressLabel={uri ? pb.progressLabel : t('results.playbackUnavailable')}
          onToggle={uri && pb.isReady ? pb.toggle : undefined}
        />
      </WaveformCard>
      {showDivider ? <Divider /> : null}
    </Box>
  )
}
