import { useEffect, useMemo, useState } from 'react'
import { decodeWavWaveform } from './wavDecode'

export type WaveformData = {
  waveformPeaks: number[]
  durationMs: number
  sampleRate: number
}

/**
 * Returns waveform data from attempt metrics if present, otherwise decodes it from a WAV file.
 * Safe for Node-based tests (decode uses dynamic import for expo-file-system).
 */
export function useWaveformData(params: {
  uri: string | null | undefined
  metrics?: any
  bars?: number
}) {
  const { uri, metrics, bars = 72 } = params
  const metricsPeaks = metrics?.waveformPeaks as number[] | undefined
  const metricsDuration = metrics?.audioDurationMs as number | undefined
  const metricsRate = metrics?.audioSampleRate as number | undefined

  const metricsData = useMemo<WaveformData | null>(() => {
    if (Array.isArray(metricsPeaks) && metricsPeaks.length) {
      return {
        waveformPeaks: metricsPeaks,
        durationMs: typeof metricsDuration === 'number' ? metricsDuration : 0,
        sampleRate: typeof metricsRate === 'number' ? metricsRate : 44100,
      }
    }
    return null
  }, [metricsDuration, metricsPeaks, metricsRate])

  const [decoded, setDecoded] = useState<WaveformData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (metricsData) {
        setDecoded(null)
        setLoading(false)
        return
      }
      if (!uri) {
        setDecoded(null)
        setLoading(false)
        return
      }
      setLoading(true)
      const res = await decodeWavWaveform(uri, bars)
      if (!mounted) return
      setDecoded(res)
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [uri, bars, metricsData])

  return {
    data: metricsData ?? decoded,
    loading,
  }
}
