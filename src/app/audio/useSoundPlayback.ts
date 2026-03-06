import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { audioSession } from '@/core/audio/session'
import { initInterruptions, onInterruption } from '@/core/audio/interruptions'
import { logger } from '@/core/observability/logger'

export type SoundPlaybackState = {
  isReady: boolean
  isPlaying: boolean
  positionMs: number
  durationMs: number
}

export function useSoundPlayback(uri: string | null | undefined) {
  const soundRef = useRef<any>(null)
  const [state, setState] = useState<SoundPlaybackState>({
    isReady: false,
    isPlaying: false,
    positionMs: 0,
    durationMs: 0,
  })

  const unload = useCallback(async () => {
    const s = soundRef.current
    soundRef.current = null
    if (s) {
      try {
        await s.unloadAsync()
      } catch {
        // ignore
      }
    }
    setState({ isReady: false, isPlaying: false, positionMs: 0, durationMs: 0 })
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      await unload()
      if (!uri) return

      // Ensure interruption broker is active for app-state + route events.
      initInterruptions()
      await audioSession.enter('playback').catch((e) => logger.warn('audioSession.enter(playback) failed', e))

      // Dynamic import so Node-based UI tests can load this file without pulling in native modules.
      let Audio: any
      try {
        ;({ Audio } = await import('expo-av'))
      } catch {
        return
      }

      const s = new Audio.Sound()
      soundRef.current = s
      try {
        await s.loadAsync({ uri }, { shouldPlay: false }, false)
        s.setOnPlaybackStatusUpdate((status: any) => {
          if (!mounted) return
          if (!status.isLoaded) {
            setState((prev) => ({ ...prev, isReady: false, isPlaying: false }))
            return
          }
          setState({
            isReady: true,
            isPlaying: !!status.isPlaying,
            positionMs: status.positionMillis ?? 0,
            durationMs: status.durationMillis ?? 0,
          })
        })
        const st = await s.getStatusAsync()
        if (st.isLoaded) {
          setState({
            isReady: true,
            isPlaying: !!st.isPlaying,
            positionMs: st.positionMillis ?? 0,
            durationMs: st.durationMillis ?? 0,
          })
        }
      } catch {
        await unload()
      }
    })()

    return () => {
      mounted = false
      unload()
      audioSession.leave('playback').catch((e) => logger.warn('audioSession.leave(playback) failed', e))
    }
  }, [uri, unload])

  // If app backgrounds or audio session errors occur, unload safely.
  useEffect(() => {
    return onInterruption((e) => {
      if (e.type === 'app_state' && e.to !== 'active') {
        unload()
      }
      if (e.type === 'audio_session_error') {
        unload()
      }
    })
  }, [unload])

  const toggle = useCallback(async () => {
    const s = soundRef.current
    if (!s) return
    const st = await s.getStatusAsync()
    if (!st.isLoaded) return
    if (st.isPlaying) {
      await s.pauseAsync()
    } else {
      // If at end, restart.
      if (st.durationMillis != null && st.positionMillis != null && st.positionMillis >= st.durationMillis) {
        await s.setPositionAsync(0)
      }
      await s.playAsync()
    }
  }, [])

  const seekToMs = useCallback(async (ms: number) => {
    const s = soundRef.current
    if (!s) return
    const st = await s.getStatusAsync()
    if (!st.isLoaded) return

    const dur = st.durationMillis ?? 0
    const clamped = Math.max(0, Math.min(dur > 0 ? dur : ms, Math.floor(ms)))
    try {
      await s.setPositionAsync(clamped)
    } catch {
      // ignore
    }
  }, [])

  const seekToProgress = useCallback(
    async (p: number) => {
      const s = soundRef.current
      if (!s) return
      const st = await s.getStatusAsync()
      if (!st.isLoaded) return
      const dur = st.durationMillis ?? 0
      if (!dur) return
      const clampedP = Math.max(0, Math.min(1, p))
      await seekToMs(Math.floor(dur * clampedP))
    },
    [seekToMs],
  )

  const progress = useMemo(() => {
    if (!state.durationMs) return 0
    return Math.min(1, Math.max(0, state.positionMs / state.durationMs))
  }, [state.durationMs, state.positionMs])

  const progressLabel = useMemo(() => {
    const mmss = (ms: number) => {
      const total = Math.floor(ms / 1000)
      const m = Math.floor(total / 60)
      const s = total % 60
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }
    return `${mmss(state.positionMs)} / ${mmss(state.durationMs)}`
  }, [state.durationMs, state.positionMs])

  return {
    ...state,
    state,
    progress,
    progressLabel,
    toggle,
    seekToMs,
    seekToProgress,
    unload,
  }
}
