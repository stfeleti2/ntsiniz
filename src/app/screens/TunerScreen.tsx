import React, { useEffect, useMemo, useRef, useState } from "react"
import { Box } from "@/ui"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Screen } from "@/ui/components/Screen"
import { Text } from "@/ui/components/Typography"
import { Button } from "@/ui/components/Button"
import { Card } from "@/ui/components/Card"
import type { RootStackParamList } from "../navigation/types"
import { ensureMicPermission, startMic, type MicHandle } from "@/core/audio/micStream"
import type { PitchReading } from "@/core/pitch/pitchEngine"
import { PitchTruth } from "@/core/pitch/pitchTruth"
import { getSettings } from "@/core/storage/settingsRepo"
import { t } from '@/app/i18n'
import { formatNumber } from '@/core/i18n'
import { TunerGauge } from "@/ui/tuner/TunerGauge"
import { reportUiError } from '@/app/telemetry/report'
import { probeAudioInputFormat } from '@/core/audio/audioFormatProbe'

type Props = NativeStackScreenProps<RootStackParamList, "Tuner">

export function TunerScreen({ navigation }: Props) {
  const [running, setRunning] = useState(false)
  const [reading, setReading] = useState<PitchReading | null>(null)
  const [noiseGate, setNoiseGate] = useState(0.02)

  const micRef = useRef<MicHandle | null>(null)
  const engineRef = useRef<PitchTruth | null>(null)

  const centsHistory = useRef<number[]>([])
  const [stability, setStability] = useState(0)

  useEffect(() => {
    getSettings().then((s) => setNoiseGate(s.noiseGateRms)).catch(() => {})
  }, [])

  useEffect(() => {
    return () => {
      micRef.current?.stop().catch(() => {})
    }
  }, [])

  const start = async () => {
    const ok = await ensureMicPermission()
    if (!ok) return

    const fmt = await probeAudioInputFormat().catch(() => ({ sampleRate: 44100, channels: 1 as const, bufferDurationMs: 10 }))

    engineRef.current = new PitchTruth({ sampleRate: fmt.sampleRate, noiseGateRms: noiseGate, minConfidence: 0.35, noteChangeConfirmFrames: 2 })

    micRef.current?.stop().catch(() => {})
    micRef.current = await startMic(
      { sampleRate: fmt.sampleRate, frameDurationMs: 20 },
      (ev) => {
        const r = engineRef.current?.pushPcmBase64(ev.pcmBase64) ?? null
        if (r) {
          setReading(r)
          centsHistory.current.push(r.cents)
          if (centsHistory.current.length > 25) centsHistory.current.shift()
          setStability(stddev(centsHistory.current))
        }
      },
      (msg) => reportUiError(msg),
    )

    setRunning(true)
  }

  const stop = async () => {
    await micRef.current?.stop().catch(() => {})
    micRef.current = null
    engineRef.current = null
    setRunning(false)
    setReading(null)
    centsHistory.current = []
    setStability(0)
  }

  const status = useMemo(() => {
    if (!reading) return t('tuner.prompt')
    const ok = Math.abs(reading.cents) <= 25
    return t('tuner.status', { note: reading.note, freq: formatNumber(reading.freqHz, { maximumFractionDigits: 1, minimumFractionDigits: 1 }), cents: formatNumber(reading.cents, { maximumFractionDigits: 0, minimumFractionDigits: 0 }), ok: ok ? '✓' : '' })
  }, [reading])

  return (
    <Screen scroll background="gradient">
      <Text preset="h1">{t('tuner.title')}</Text>
      <Text preset="muted">{t('tuner.subtitle')}</Text>

      <Card>
        <Text preset="h2">{t('tuner.liveTitle')}</Text>
        <Text preset="muted">{status}</Text>

        <Box style={{ alignItems: "center" }}> {reading ? <TunerGauge cents={reading.cents} windowCents={25} /> : <Box style={{ height: 200 }} />}</Box>

        <Text preset="muted">{t('tuner.stability', { value: formatNumber(stability, { maximumFractionDigits: 1, minimumFractionDigits: 1 }) })}</Text>

        <Button text={running ? t('common.stop') : t('common.start')} onPress={running ? stop : start} />
      </Card>

      <Card>
        <Text preset="h2">{t('common.next')}</Text>
        <Button text={t('session.title')} onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Session' })} />
        <Button text={t('calibration.title')} variant="ghost" onPress={() => navigation.navigate('Calibration')} />
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}

function stddev(xs: number[]) {
  if (xs.length < 2) return 0
  const m = xs.reduce((a, b) => a + b, 0) / xs.length
  const v = xs.reduce((a, b) => a + (b - m) * (b - m), 0) / (xs.length - 1)
  return Math.sqrt(v)
}