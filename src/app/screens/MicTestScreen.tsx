import React, { useEffect, useRef, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Card } from '@/ui/components/kit'
import { Button } from '@/ui/components/kit'
import { Box } from '@/ui'
import type { RootStackParamList } from '../navigation/types'
import { ensureMicPermission, startMic, type MicHandle } from '@/core/audio/micStream'
import { pcmBase64ToFloat32, rms } from '@/core/audio/pcm'
import { probeAudioInputFormat } from '@/core/audio/audioFormatProbe'
import { t } from '@/app/i18n'
import { formatNumber } from '@/core/i18n'
import { reportUiError } from '@/app/telemetry/report'
import { getSettings, upsertSettings } from '@/core/storage/settingsRepo'
import { logger } from '@/core/observability/logger'

type Props = NativeStackScreenProps<RootStackParamList, 'MicTest'>

export function MicTestScreen({ navigation }: Props) {
  const [running, setRunning] = useState(false)
  const [level, setLevel] = useState(0)
  const [peak, setPeak] = useState(0)
  const [clipped, setClipped] = useState(false)
  const [hint, setHint] = useState<string>('')

  const micRef = useRef<MicHandle | null>(null)
  const lastLevels = useRef<number[]>([])

  useEffect(() => {
    return () => {
      micRef.current?.stop().catch((e) => logger.warn('MicTest stop failed', e))
    }
  }, [])

  const start = async () => {
    const ok = await ensureMicPermission()
    if (!ok) return

    const fmt = await probeAudioInputFormat().catch(() => ({ sampleRate: 44100, channels: 1 as const, bufferDurationMs: 10 }))
    setRunning(true)
    setHint('')
    lastLevels.current = []
    setClipped(false)
    setPeak(0)

    micRef.current?.stop().catch((e) => logger.warn('MicTest stop failed', e))
    micRef.current = await startMic(
      { sampleRate: fmt.sampleRate, frameDurationMs: 20 },
      (ev) => {
        const frame = pcmBase64ToFloat32(ev.pcmBase64)
        const r = rms(frame)
        let p = 0
        for (let i = 0; i < frame.length; i++) p = Math.max(p, Math.abs(frame[i]))

        lastLevels.current.push(r)
        if (lastLevels.current.length > 25) lastLevels.current.shift()
        const avg = lastLevels.current.reduce((a, b) => a + b, 0) / Math.max(1, lastLevels.current.length)
        setLevel(avg)
        setPeak((prev) => Math.max(prev, p))
        if (p >= 0.99) setClipped(true)
      },
      (msg) => reportUiError(msg),
    )

    // auto-stop after 5s
    setTimeout(() => stop(true), 5000)
  }

  const stop = async (auto = false) => {
    await micRef.current?.stop().catch((e) => logger.warn('MicTest stop failed', e))
    micRef.current = null
    setRunning(false)

    if (!auto) return
    const l = level
    if (clipped) setHint(t('micTest.hintClipping') ?? 'Clipping detected. Move the phone slightly farther away or sing softer.')
    else if (l < 0.02) setHint(t('micTest.hintQuiet') ?? 'Input is very quiet. Try a quieter room or move closer to the mic.')
    else setHint(t('micTest.hintOk') ?? 'Mic input looks good.')

    // Persist calibration snapshot (used as guidance for defaults).
    try {
      const s = await getSettings()
      const fmt = await probeAudioInputFormat().catch(() => null)
      await upsertSettings({
        ...s,
        hasCalibrated: true,
        micCalibratedRms: l,
        micCalibratedPeak: peak,
        micCalibratedClipped: clipped,
        preferredSampleRate: fmt?.sampleRate ?? s.preferredSampleRate ?? 0,
      })
    } catch {
      // ignore
    }
  }

  return (
    <Screen scroll>
      <Text preset="h1">{t('micTest.title') ?? 'Test microphone'}</Text>
      <Text preset="muted">{t('micTest.subtitle') ?? 'Do a quick 5-second check for level and clipping before drills.'}</Text>

      <Card>
        <Text preset="h2">{t('micTest.live') ?? 'Live level'}</Text>
        <Text preset="muted">{t('micTest.level', { v: formatNumber(level, { maximumFractionDigits: 3, minimumFractionDigits: 3 }) }) ?? `Level: ${formatNumber(level, { maximumFractionDigits: 3, minimumFractionDigits: 3 })}`}</Text>
        <Text preset="muted">{t('micTest.peak', { v: formatNumber(peak, { maximumFractionDigits: 2, minimumFractionDigits: 2 }) }) ?? `Peak: ${formatNumber(peak, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`}</Text>
        <Text preset="muted">{clipped ? t('micTest.clipped') ?? 'Clipping: YES' : t('micTest.notClipped') ?? 'Clipping: no'}</Text>
        <Box style={{ height: 12 }} />
        <Button text={running ? t('common.stop') ?? 'Stop' : t('common.start') ?? 'Start'} onPress={running ? () => stop(false) : start} />
      </Card>

      {hint ? (
        <Card tone="elevated">
          <Text preset="h2">{t('micTest.hintTitle') ?? 'Tip'}</Text>
          <Text preset="muted">{hint}</Text>
        </Card>
      ) : null}

      <Button text={t('common.back') ?? 'Back'} variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  )
}
