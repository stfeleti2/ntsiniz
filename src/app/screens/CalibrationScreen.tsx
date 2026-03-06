import React, { useMemo, useRef, useState } from "react"
import { Stack } from "@/ui/primitives"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Screen } from "@/ui/components/Screen"
import { Text } from "@/ui/components/Typography"
import { Button } from "@/ui/components/Button"
import { Card } from "@/ui/components/Card"
import type { RootStackParamList } from "../navigation/types"
import { ensureMicPermission, startMic, type MicHandle } from "@/core/audio/micStream"
import { pcmBase64ToFloat32, rms } from "@/core/audio/pcm"
import { getSettings, upsertSettings } from "@/core/storage/settingsRepo"
import { t } from '@/app/i18n'
import { formatNumber } from '@/core/i18n'
import { reportUiError } from '@/app/telemetry/report'
import { probeAudioInputFormat } from '@/core/audio/audioFormatProbe'

type Props = NativeStackScreenProps<RootStackParamList, "Calibration">

export function CalibrationScreen({ navigation }: Props) {
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle")
  const [bgRms, setBgRms] = useState<number | null>(null)
  const [gate, setGate] = useState<number | null>(null)

  const micRef = useRef<MicHandle | null>(null)
  const samplesRef = useRef<number[]>([])

  const label = useMemo(() => {
    if (status === 'idle') return t('calibration.labelIdle')
    if (status === 'running') return t('calibration.labelRunning')
    return t('calibration.labelDone')
  }, [status])

  const runCalibration = async () => {
    const ok = await ensureMicPermission()
    if (!ok) return

    const fmt = await probeAudioInputFormat().catch(() => ({ sampleRate: 44100, channels: 1 as const, bufferDurationMs: 10 }))

    setStatus("running")
    samplesRef.current = []

    micRef.current?.stop().catch(() => {})
    micRef.current = await startMic(
      { sampleRate: fmt.sampleRate, frameDurationMs: 20 },
      (ev) => {
        const frame = pcmBase64ToFloat32(ev.pcmBase64)
        samplesRef.current.push(rms(frame))
      },
      (msg) => reportUiError(msg),
    )

    // wait 2s
    await new Promise((r) => setTimeout(r, 2000))

    await micRef.current.stop()
    micRef.current = null

    const xs = samplesRef.current
    const avg = xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0.01
    const newGate = clamp(avg * 2.5, 0.01, 0.08)

    setBgRms(avg)
    setGate(newGate)

    const s = await getSettings()
    await upsertSettings({ ...s, noiseGateRms: newGate, hasCalibrated: true })
    setStatus("done")
  }

  return (
    <Screen scroll>
      <Text preset="h1">{t('calibration.title')}</Text>
      <Text preset="muted">{t('calibration.subtitle')}</Text>

      <Card>
        <Text preset="h2">{t('calibration.step1Title')}</Text>
        <Text preset="muted">{label}</Text>

        {bgRms != null && (
          <Stack gap={6}>
            <Text preset="muted">{t('calibration.bgRms', { value: formatNumber(bgRms, { maximumFractionDigits: 4, minimumFractionDigits: 4 }) })}</Text>
            <Text preset="muted">{t('calibration.gateSet', { value: typeof gate === 'number' ? formatNumber(gate, { maximumFractionDigits: 4, minimumFractionDigits: 4 }) : '—' })}</Text>
          </Stack>
        )}

        <Button text={status === 'running' ? t('calibration.measuring') : t('calibration.run')} disabled={status === "running"} onPress={runCalibration} />
      </Card>

      <Card>
        <Text preset="h2">{t('calibration.nextTitle')}</Text>
        <Text preset="muted">{t('calibration.nextSubtitle')}</Text>
        <Button text={t('calibration.enterApp')} onPress={() => navigation.replace('MainTabs')} />
        <Button text={t('calibration.goToTuner')} variant="ghost" onPress={() => navigation.replace('Tuner')} />
      </Card>

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}

function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x))
}