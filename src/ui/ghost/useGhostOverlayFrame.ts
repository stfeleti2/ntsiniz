import { useEffect, useRef, useState } from 'react'
import type { PitchReading } from '@/core/pitch/pitchEngine'
import type { GhostGuideState } from '@/core/drills/runnerMachine'
import type { GhostSegment } from '@/ui/ghost/GhostGuideOverlay'

type PerfPlan = { startedAtMs: number; segments: GhostSegment[]; toleranceCents: number } | null

/**
 * Throttle Ghost Guide overlay inputs so we don't re-render at audio callback rate.
 * Target: ~20fps updates for pitch, while keeping animations on the UI thread.
 */
export function useGhostOverlayFrame(opts: {
  reading: PitchReading | null
  drill?: GhostGuideState | null
  performancePlan?: PerfPlan
  enabled?: boolean
  fps?: number
}) {
  const { enabled = true, fps = 20 } = opts

  const readingRef = useRef<PitchReading | null>(opts.reading ?? null)
  const drillRef = useRef<GhostGuideState | null | undefined>(opts.drill)
  const perfRef = useRef<PerfPlan>(opts.performancePlan ?? null)

  // Always keep refs up-to-date without triggering interval reset.
  readingRef.current = opts.reading ?? null
  drillRef.current = opts.drill
  perfRef.current = opts.performancePlan ?? null

  const [frame, setFrame] = useState(() => ({
    nowMs: Date.now(),
    reading: readingRef.current,
    drill: drillRef.current ?? null,
    performancePlan: perfRef.current,
  }))

  useEffect(() => {
    if (!enabled) return
    const ms = Math.max(16, Math.floor(1000 / fps))
    const id = setInterval(() => {
      setFrame({
        nowMs: Date.now(),
        reading: readingRef.current,
        drill: drillRef.current ?? null,
        performancePlan: perfRef.current,
      })
    }, ms)
    return () => clearInterval(id)
  }, [enabled, fps])

  return frame
}
