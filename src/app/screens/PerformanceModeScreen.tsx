import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import type { RootStackParamList } from '../navigation/types'
import { t } from '@/app/i18n'
import { formatNumber } from '@/core/i18n'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { Box } from '@/ui'
import { TunerGauge } from '@/ui/tuner/TunerGauge'

import * as ExpoCamera from 'expo-camera'
import * as VideoThumbnails from 'expo-video-thumbnails'

import { ensureMicPermission, startMic, type MicHandle } from '@/core/audio/micStream'
import type { PitchReading } from '@/core/pitch/pitchEngine'
import { PitchTruth } from '@/core/pitch/pitchTruth'
import { getSettings } from '@/core/storage/settingsRepo'
import { hasPro } from '@/core/billing/entitlementsRepo'
import { getPerformanceTemplate, PERFORMANCE_TEMPLATES } from '@/core/performance/templates'
import { persistImageTemp, persistVideoTemp } from '@/core/performance/files'
import { createClip } from '@/core/performance/clipsRepo'
import { ensureSelfPerson } from '@/core/social/peopleRepo'
import { playToneSequence } from '@/app/audio/tonePlayer'
import { GhostGuideOverlay } from '@/ui/ghost'
import { useGhostOverlayFrame } from '@/ui/ghost/useGhostOverlayFrame'
import { getPerformanceGhostPlan } from '@/core/performance/ghostPlans'
import { reportUiError } from '@/app/telemetry/report'
import { probeAudioInputFormat } from '@/core/audio/audioFormatProbe'

type Props = NativeStackScreenProps<RootStackParamList, 'PerformanceMode'>

export function PerformanceModeScreen({ navigation, route }: Props) {
  const initialTemplateId = (route.params as any)?.templateId as string | undefined
  const [templateId, setTemplateId] = useState<string>(initialTemplateId ?? PERFORMANCE_TEMPLATES[0].id)

  const tpl = useMemo(() => getPerformanceTemplate(templateId), [templateId])
  const ghostPlan = useMemo(() => getPerformanceGhostPlan(tpl.id), [tpl.id])

  const cameraRef = useRef<any>(null)

  const [camPerm, requestCamPerm] = (ExpoCamera as any).useCameraPermissions?.() ?? [null, async () => ({ granted: false })]

  const [recording, setRecording] = useState(false)
  const [reading, setReading] = useState<PitchReading | null>(null)
  const [score, setScore] = useState(0)
  const [stability, setStability] = useState(0)
  const [remaining, setRemaining] = useState(tpl.durationSec)

  const micRef = useRef<MicHandle | null>(null)
  const engineRef = useRef<PitchTruth | null>(null)
  const centsHistory = useRef<number[]>([])
  const frames = useRef(0)
  const goodFrames = useRef(0)
  const lastCents = useRef(0)
  const startedAtRef = useRef<number>(0)
  const [noiseGate, setNoiseGate] = useState(0.02)
  const [ghostAdvanced, setGhostAdvanced] = useState(false)
  const ghostFrame = useGhostOverlayFrame({ reading, performancePlan: recording ? { startedAtMs: startedAtRef.current || Date.now(), segments: ghostPlan.segments, toleranceCents: ghostPlan.toleranceCents } : null, fps: 20 })

  useEffect(() => {
    ;(async () => {
      const s = await getSettings().catch(() => null)
      if (s) setNoiseGate(s.noiseGateRms)
      const pro = await hasPro().catch(() => false)
      setGhostAdvanced(!!(pro && s?.ghostAdvanced))
    })()
  }, [])

  useEffect(() => {
    setRemaining(tpl.durationSec)
  }, [tpl.id])

  useEffect(() => {
    return () => {
      void stopPitch().catch(() => {})
    }
  }, [])

  const startPitch = async () => {
    const ok = await ensureMicPermission()
    if (!ok) return false

    const fmt = await probeAudioInputFormat().catch(() => ({ sampleRate: 44100, channels: 1 as const, bufferDurationMs: 10 }))

    engineRef.current = new PitchTruth({ sampleRate: fmt.sampleRate, noiseGateRms: noiseGate, minConfidence: 0.35, noteChangeConfirmFrames: 2 })

    await stopPitch()
    micRef.current = await startMic(
      { sampleRate: fmt.sampleRate, frameDurationMs: 20 },
      (ev) => {
        const r = engineRef.current?.pushPcmBase64(ev.pcmBase64) ?? null
        if (!r) return
        setReading(r)
        lastCents.current = r.cents

        if (recording) {
          frames.current += 1
          if (Math.abs(r.cents) <= 25) goodFrames.current += 1
          const pct = frames.current ? Math.round((goodFrames.current / frames.current) * 100) : 0
          setScore(pct)
        }

        centsHistory.current.push(r.cents)
        if (centsHistory.current.length > 25) centsHistory.current.shift()
        setStability(stddev(centsHistory.current))
      },
      (msg) => reportUiError(msg),
    )

    return true
  }

  const stopPitch = async () => {
    await micRef.current?.stop().catch(() => {})
    micRef.current = null
    engineRef.current = null
    setReading(null)
    centsHistory.current = []
    setStability(0)
  }

  const ensureCamera = async () => {
    const cur = camPerm
    if (cur?.granted) return true
    const res = await requestCamPerm()
    return !!res?.granted
  }

  const resetScoring = () => {
    frames.current = 0
    goodFrames.current = 0
    setScore(0)
    lastCents.current = 0
  }

  const startRecording = async () => {
    // Store-friendly primer: explain why camera+mic are needed before the first performance recording.
    try {
      const s = await getSettings()
      if (!s.seenCameraPrimer) {
        ;(navigation as any).navigate('PermissionsPrimer', {
          kind: 'camera',
          next: { name: 'PerformanceMode', params: route.params ?? undefined },
        })
        return
      }
    } catch {
      // ignore
    }

    const camOk = await ensureCamera()
    if (!camOk) {
      Alert.alert(t('performance.permissionsTitle'), t('performance.cameraDenied'))
      return
    }

    const micOk = await startPitch()
    if (!micOk) {
      Alert.alert(t('performance.permissionsTitle'), t('performance.micDenied'))
      return
    }

    if (!cameraRef.current?.recordAsync) {
      Alert.alert(t('performance.errorTitle'), t('performance.cameraNotReady'))
      return
    }

    resetScoring()

    startedAtRef.current = Date.now()

    setRecording(true)
    setRemaining(tpl.durationSec)

    // A tiny count-in beep so the clip feels intentional.
    void playToneSequence(
      [
        { freqHz: 880, durationMs: 90, gapMs: 140 },
        { freqHz: 880, durationMs: 90, gapMs: 140 },
        { freqHz: 988, durationMs: 120, gapMs: 0 },
      ],
      { volume: 0.55 },
    ).catch(() => {})

    const startedAt = Date.now()
    const durationMs = tpl.durationSec * 1000

    const tick = setInterval(() => {
      const left = Math.max(0, durationMs - (Date.now() - startedAt))
      setRemaining(Math.ceil(left / 1000))
    }, 120)

    // Safety stop.
    const stopId = setTimeout(() => {
      try {
        cameraRef.current?.stopRecording?.()
      } catch {}
    }, durationMs + 350)

    try {
      const vid = await cameraRef.current.recordAsync({ maxDuration: tpl.durationSec, quality: '720p' })
      clearInterval(tick)
      clearTimeout(stopId)
      setRecording(false)

      const tempUri: string = vid?.uri
      if (!tempUri) throw new Error('Missing video uri')

      const clipId = `clip_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
      const videoUri = await persistVideoTemp(tempUri, clipId)

      let thumbUri: string | null = null
      try {
        const thumb = await (VideoThumbnails as any).getThumbnailAsync(videoUri, { time: 0 })
        if (thumb?.uri) thumbUri = await persistImageTemp(thumb.uri, clipId)
      } catch {
        thumbUri = null
      }

      const me = await ensureSelfPerson()
      const finalScore = frames.current ? Math.round((goodFrames.current / frames.current) * 100) : 0
      const clip = await createClip({
        userId: me.id,
        displayName: me.displayName,
        templateId: tpl.id,
        title: tpl.title,
        durationMs,
        videoUri,
        thumbnailUri: thumbUri,
        score: finalScore,
        metrics: {
          frames: frames.current,
          goodFrames: goodFrames.current,
          stabilityCents: Number.isFinite(stability) ? stability : 0,
        },
      })

      ;(navigation as any).navigate('PerformancePreview', { clipId: clip.id })
    } catch (e: any) {
      clearInterval(tick)
      clearTimeout(stopId)
      setRecording(false)
      reportUiError(e)
      Alert.alert(t('performance.errorTitle'), t('performance.recordFailed'))
    } finally {
      await stopPitch().catch(() => {})
    }
  }

  const stopRecording = async () => {
    try {
      cameraRef.current?.stopRecording?.()
    } catch {}
  }

  const PermissionBlock = () => {
    const camGranted = !!camPerm?.granted
    return (
      <Card tone="glow">
        <Text preset="h2">{t('performance.permissionsTitle')}</Text>
        <Text preset="muted">{t('performance.permissionsSubtitle')}</Text>
        <Box style={{ gap: 10, marginTop: 10 }}>
          <Button text={camGranted ? t('performance.cameraGranted') : t('performance.requestCamera')} onPress={async () => requestCamPerm()} />
          <Button text={t('performance.requestMic')} variant="soft" onPress={async () => startPitch()} />
          <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
        </Box>
      </Card>
    )
  }

  const CameraView: any = (ExpoCamera as any).CameraView ?? (ExpoCamera as any).Camera

  const camReady = !!camPerm?.granted

  return (
    <Screen background="plain" style={{ padding: 0, gap: 0 }}>
      {!camReady ? (
        <Box style={{ padding: 16 }}>
          <PermissionBlock />
        </Box>
      ) : (
        <View style={styles.full}>
          <CameraView
            ref={cameraRef}
            style={styles.full}
            facing={(ExpoCamera as any).CameraType?.front ?? 'front'}
          />

          {/* Ghost Guide overlay (Aurora highway). */}
          <View pointerEvents="none" style={styles.ghostWrap}>
            <GhostGuideOverlay
              nowMs={ghostFrame.nowMs}
              reading={ghostFrame.reading}
              advanced={ghostAdvanced}
              performancePlan={
                recording
                  ? {
                      startedAtMs: startedAtRef.current || Date.now(),
                      segments: ghostPlan.segments,
                      toleranceCents: ghostPlan.toleranceCents,
                    }
                  : null
              }
            />
          </View>

          {/* Overlay */}
          <View pointerEvents="none" style={styles.overlayTop}>
            <Box style={{ paddingHorizontal: 16, paddingTop: 10, gap: 8 }}>
              <Text preset="h2">{t('performance.title')}</Text>
              <Text preset="muted">{tpl.subtitle}</Text>
            </Box>
          </View>

          <View pointerEvents="none" style={styles.overlayCenter}>
            <Box style={{ alignItems: 'center', gap: 12 }}>
              {reading ? <TunerGauge cents={reading.cents} windowCents={25} /> : <Box style={{ height: 200 }} />}
              <Text preset="body" style={{ fontWeight: '900' }}>{t('performance.liveLine', { score, sec: remaining })}</Text>
              <Text preset="muted">{t('performance.stabilityLine', { value: formatNumber(stability, { maximumFractionDigits: 1, minimumFractionDigits: 1 }) })}</Text>
            </Box>
          </View>

          <View pointerEvents="none" style={styles.watermark}>
            <Text preset="muted" style={{ fontWeight: '900', opacity: 0.9 }}>{t('brand.name')}</Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <Box style={{ padding: 16, gap: 10 }}>
              <Card tone="elevated">
                <Text preset="h2">{t('performance.pickTemplate')}</Text>
                <Text preset="muted">{t('performance.pickTemplateHint')}</Text>
                <Box style={{ marginTop: 10, gap: 10 }}>
                  {PERFORMANCE_TEMPLATES.map((x) => (
                    <Button
                      key={x.id}
                      text={`${x.title} · ${x.durationSec}s`}
                      variant={x.id === templateId ? 'primary' : 'soft'}
                      disabled={recording}
                      onPress={() => setTemplateId(x.id)}
                    />
                  ))}
                </Box>
              </Card>

              <Button
                text={recording ? t('performance.stop') : t('performance.record')}
                onPress={recording ? stopRecording : startRecording}
              />
              <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
            </Box>
          </View>
        </View>
      )}
    </Screen>
  )
}

function stddev(xs: number[]) {
  if (xs.length < 2) return 0
  const m = xs.reduce((a, b) => a + b, 0) / xs.length
  const v = xs.reduce((a, b) => a + (b - m) * (b - m), 0) / (xs.length - 1)
  return Math.sqrt(v)
}

const styles = StyleSheet.create({
  full: { flex: 1 },
  ghostWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  overlayCenter: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  watermark: {
    position: 'absolute',
    right: 14,
    bottom: 160,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
})
