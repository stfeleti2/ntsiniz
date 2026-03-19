import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box } from '@/ui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import type { RootStackParamList } from '../navigation/types'
import { ensureMicPermission, startMic, type MicHandle } from '@/core/audio/micStream'
import type { PitchReading } from '@/core/pitch/pitchEngine'
import { PitchTruth } from '@/core/pitch/pitchTruth'
import { getSettings } from '@/core/storage/settingsRepo'
import { probeAudioInputFormat } from '@/core/audio/audioFormatProbe'
import { AdaptiveInstructionBlock, BrandWorldBackdrop, ConfidenceIndicator, CurrentZoneChip, HexagonStateRenderer, LivePitchTrace, StabilityMeter, StatusPill } from '@/ui/guidedJourney'

type Props = NativeStackScreenProps<RootStackParamList, 'Tuner'>

const copy = {
  title: 'Live tuner',
  subtitle: 'Low chrome, real pitch trust, and one calm instruction at a time.',
  start: 'Start tuner',
  stop: 'Stop tuner',
  session: 'Open training',
  retune: 'Retune audio',
  loading: 'Listening for a clear pitch…',
  instructionTitle: 'Adaptive instruction',
}

export function TunerScreen({ navigation }: Props) {
  const [running, setRunning] = useState(false)
  const [reading, setReading] = useState<PitchReading | null>(null)
  const [noiseGate, setNoiseGate] = useState(0.02)
  const [stability, setStability] = useState(0)

  const micRef = useRef<MicHandle | null>(null)
  const engineRef = useRef<PitchTruth | null>(null)
  const centsHistory = useRef<number[]>([])

  useEffect(() => {
    getSettings().then((settings) => setNoiseGate(settings.noiseGateRms)).catch(() => {})
  }, [])

  useEffect(() => {
    return () => {
      void micRef.current?.stop().catch(() => {})
    }
  }, [])

  const start = async () => {
    const ok = await ensureMicPermission()
    if (!ok) {
      navigation.navigate('Recovery', { reason: 'micDenied', next: { name: 'Tuner' } })
      return
    }

    const format = await probeAudioInputFormat().catch(() => ({ sampleRate: 44100, channels: 1 as const, bufferDurationMs: 10 }))
    engineRef.current = new PitchTruth({ sampleRate: format.sampleRate, noiseGateRms: noiseGate, minConfidence: 0.35, noteChangeConfirmFrames: 2 })

    await micRef.current?.stop().catch(() => {})
    micRef.current = await startMic(
      { sampleRate: format.sampleRate, frameDurationMs: 20 },
      (event) => {
        const next = engineRef.current?.pushPcmBase64(event.pcmBase64) ?? null
        if (!next) return
        setReading(next)
        centsHistory.current.push(next.cents)
        if (centsHistory.current.length > 32) centsHistory.current.shift()
        setStability(stddev(centsHistory.current))
      },
      () => navigation.navigate('Recovery', { reason: 'audioSetup', next: { name: 'Tuner' } }),
    )
    setRunning(true)
  }

  const stop = async () => {
    await micRef.current?.stop().catch(() => {})
    micRef.current = null
    engineRef.current = null
    centsHistory.current = []
    setReading(null)
    setStability(0)
    setRunning(false)
  }

  const trace = useMemo(() => centsHistory.current.map((value) => clamp((value + 50) / 100)), [reading, stability])
  const hexState = !reading ? (running ? 'listening' : 'ready') : Math.abs(reading.cents) <= 20 ? 'locked' : 'tracking'
  const instruction = !reading
    ? copy.loading
    : Math.abs(reading.cents) <= 20
      ? 'You are centered. Keep the breath easy and let the note stay there.'
      : reading.cents < 0
        ? 'You are a little low. Glide upward slowly instead of jumping.'
        : 'You are a little high. Let the note settle lower without dropping your breath.'

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{copy.title}</Text>
        <Text preset="muted">{copy.subtitle}</Text>
      </Box>

      <StatusPill state={running ? 'listening' : 'ready'} label={running ? 'Listening' : 'Ready'} />

      <HexagonStateRenderer
        state={hexState}
        title={reading?.note ?? 'Ready'}
        subtitle={reading ? `${Math.round(reading.cents)} cents` : 'Start the live tuner when you are ready.'}
        progress={running ? 0.72 : 0.28}
      />

      <LivePitchTrace values={trace} />

      <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <CurrentZoneChip label={reading?.note ?? 'No note yet'} />
        <CurrentZoneChip label={reading ? `${Math.round(reading.freqHz)} Hz` : 'Pitch waiting'} />
      </Box>

      <StabilityMeter value={stability} />
      <ConfidenceIndicator value={reading?.confidence ?? 0} />

      <AdaptiveInstructionBlock title={copy.instructionTitle} body={instruction} state={hexState} />

      <Button text={running ? copy.stop : copy.start} onPress={running ? () => void stop() : () => void start()} />
      <Button text={copy.session} variant="soft" onPress={() => navigation.navigate('MainTabs' as any, { screen: 'Session' } as any)} />
      <Button text={copy.retune} variant="ghost" onPress={() => navigation.navigate('Calibration')} />
    </Screen>
  )
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value))
}

function stddev(values: number[]) {
  if (values.length < 2) return 0
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}
