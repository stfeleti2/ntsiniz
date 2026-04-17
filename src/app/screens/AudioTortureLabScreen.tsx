import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { Screen } from '@/ui/components/Screen'
import { Card } from '@/ui/components/kit'
import { Text } from '@/ui/components/Typography'
import { Button } from '@/ui/components/kit'
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { createSession } from '@/core/storage/sessionsRepo'
import { loadPhase1Pack } from '@/core/drills/loader'
import { startFrameMeter } from '@/core/perf/frameMeter'
import { getAudioSupervisorSnapshot } from '@/core/audio/audioSupervisor'
import { probeAudioInputFormat } from '@/core/audio/audioFormatProbe'
import { routeBroker } from '@/core/audio/routeBroker'
import { fileStore } from '@/core/io/fileStore'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { Platform } from 'react-native'
import { logger } from '@/core/observability/logger'

type Props = NativeStackScreenProps<RootStackParamList, 'AudioTortureLab'>

/**
 * Dev-only: a guided "torture suite" that makes it easy to reproduce audio edge-cases
 * on real devices (route changes, interruptions, seeks) without digging around.
 *
 * Note: Some steps require the tester to perform a physical action (toggle Bluetooth, take a call, etc.).
 */
export function AudioTortureLabScreen({ navigation }: Props) {
  const pack = useMemo(() => loadPhase1Pack(), [])
  const sustain = useMemo(() => pack.drills.find((d) => d.type === 'sustain') ?? pack.drills[0], [pack.drills])
  const match = useMemo(() => pack.drills.find((d) => d.type === 'match_note') ?? pack.drills[0], [pack.drills])

  const [running, setRunning] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [lastReportPath, setLastReportPath] = useState<string | null>(null)
  const [shareError, setShareError] = useState<string | null>(null)

  // Prevent double-taps creating multiple sessions.
  const runInFlightRef = useRef(false)
  // Allow cancellation if user navigates away mid-capture.
  const cancelCaptureRef = useRef({ cancelled: false })

  useEffect(() => {
    return () => {
      cancelCaptureRef.current.cancelled = true
    }
  }, [])

  const startGuidedRun = async (drillId: string) => {
    if (runInFlightRef.current) return
    runInFlightRef.current = true
    setRunning(true)
    try {
      const s = await createSession()
      navigation.navigate('Drill', { sessionId: s.id, drillId })
    } finally {
      // Give navigation a moment to mount the next screen before re-enabling.
      setTimeout(() => {
        runInFlightRef.current = false
        setRunning(false)
      }, 400)
    }
  }

  const capture10sPerfEvidence = async () => {
    setCapturing(true)
    try {
      cancelCaptureRef.current.cancelled = false
      setShareError(null)
      const meter = startFrameMeter()
      const startedAt = Date.now()
      // Capture for 10 seconds, but support cancellation on unmount.
      for (let i = 0; i < 20; i++) {
        if (cancelCaptureRef.current.cancelled) break
        await new Promise((r) => setTimeout(r, 500))
      }
      const frame = meter.stop()
      if (cancelCaptureRef.current.cancelled) {
        // User left the screen; do not write/share anything.
        return
      }
      const audio = getAudioSupervisorSnapshot()
      const probe = await probeAudioInputFormat().catch((e: unknown) => {
        logger.warn('probeAudioInputFormat failed during perf capture', { error: e })
        return null
      })
      const route = routeBroker.getState().route
      const routeFp = route ? `${route.routeType}|${route.inputName ?? ''}|${(route as any).outputName ?? ''}` : 'none'
      const endedAt = Date.now()

      const report = {
        kind: 'perf_evidence_v1',
        startedAtMs: startedAt,
        endedAtMs: endedAt,
        frame,
        audio,
        audioMeta: { routeFingerprint: routeFp, route, probe },
        notes: {
          instruction:
            'If you were recording or playing back during this capture, include what you did (route toggle, seek spam, interruption).',
        },
      }

      // Minimal validation so we don't paste malformed evidence.
      if (!Number.isFinite(report.frame?.fpsAvg) || !Number.isFinite(report.audio?.routeChangeCount)) {
        throw new Error('perf evidence report invalid')
      }

      const base = `perf_evidence_${startedAt}`

      const md = [
        `### Perf Evidence (auto)`,
        `- captured: ${new Date(startedAt).toISOString()} → ${new Date(endedAt).toISOString()}`,
        `- fpsAvg: ${frame.fpsAvg.toFixed(1)} | jankFrames: ${frame.jankFrames} | maxDeltaMs: ${frame.maxDeltaMs.toFixed(1)}`,
        `- routeChangeCount: ${audio.routeChangeCount} | interruptionCount: ${audio.interruptionCount} | audioSessionErrorCount: ${audio.audioSessionErrorCount}`,
        `- route: ${routeFp}`,
        probe ? `- probe: ${probe.sampleRateHz}Hz | ch: ${probe.channels} | estBufMs: ${probe.ioBufferDurationMs ?? 'n/a'}` : `- probe: unavailable`,
        `- json: ${base}.json (see docs:/perf/)`,
        '',
        '> Paste this block into docs/PERF_EVIDENCE.md and attach the JSON if needed.',
        '',
      ].join('\n')

      const dir = `${FileSystem.documentDirectory}perf/`
      await fileStore.ensureDir(dir)
      const jsonPath = `${dir}${base}.json`
      const mdPath = `${dir}${base}.md`
      await fileStore.writeText(jsonPath, JSON.stringify(report, null, 2))
      await fileStore.writeText(mdPath, md)
      setLastReportPath(mdPath)

      const ok = await Sharing.isAvailableAsync().catch((e: unknown) => {
        logger.warn('Sharing.isAvailableAsync failed', { error: e })
        return false
      })
      if (ok) {
        try {
          // Some Android OEMs behave better with a content:// URI.
          const sharePath = Platform.OS === 'android' ? await FileSystem.getContentUriAsync(mdPath) : mdPath
          await Sharing.shareAsync(sharePath, {
            mimeType: 'text/markdown',
            dialogTitle: t('audioTorture.sharePerfEvidence', 'Share perf evidence'),
          })
        } catch (e) {
          logger.warn('Sharing.shareAsync failed', { error: e })
          setShareError(
            t(
              'audioTorture.shareFailed',
              'Share failed on this device. You can still long-press the path below to copy it and retrieve the file from app documents.',
            ),
          )
        }
      }
    } finally {
      setCapturing(false)
    }
  }

  return (
    <Screen scroll background="gradient">
      <Text preset="h1">{t('audioTorture.title', 'Audio Torture Lab')}</Text>
      <Text preset="muted" style={{ marginTop: 6 }}>
        {t('audioTorture.subtitle', 'Run these on real devices. Capture the Support Bundle after failures.')}
      </Text>

      <Box h={12} />

      <Card>
        <Text preset="h2">{t('audioTorture.recordOverlayTitle', '1) Record + Overlay (60s)')}</Text>
        <Text preset="muted" style={{ marginTop: 6 }}>
          {t('audioTorture.recordOverlayBody', 'Start a sustain drill. While recording, toggle Bluetooth on/off once.')}
        </Text>
        <Box h={10} />
        <Button
          text={running ? t('common.loading') : 'Start sustain torture'}
          variant="primary"
          onPress={() => startGuidedRun(sustain.id)}
          disabled={running}
          testID="btn-torture-sustain"
        />
      </Card>

      <Box h={12} />

      <Card>
        <Text preset="h2">{t('audioTorture.interruptionTitle', '2) Interruption test')}</Text>
        <Text preset="muted" style={{ marginTop: 6 }}>
          {t(
            'audioTorture.interruptionBody',
            'Start a match-note drill, then trigger a notification / call. Ensure we recover.',
          )}
        </Text>
        <Box h={10} />
        <Button
          text={running ? t('common.loading') : 'Start match-note torture'}
          variant="soft"
          onPress={() => startGuidedRun(match.id)}
          disabled={running}
          testID="btn-torture-match"
        />
      </Card>

      <Box h={12} />

      <Card>
        <Text preset="h2">{t('audioTorture.seekSpamTitle', '3) Playback seek spam')}</Text>
        <Text preset="muted" style={{ marginTop: 6 }}>
          {t('audioTorture.seekSpamBody', 'After recording, go to Playback and scrub rapidly for 10 seconds.')}
        </Text>
        <Text preset="muted" style={{ marginTop: 10 }}>
          {t('audioTorture.seekSpamPass', 'Pass criteria: no stuck audio session, no silent playback, no crash.')}
        </Text>
      </Card>

      <Box h={12} />

      <Card>
        <Text preset="h2">{t('audioTorture.captureTitle', '4) Capture 10s perf evidence')}</Text>
        <Text preset="muted" style={{ marginTop: 6 }}>
          {t(
            'audioTorture.captureBody',
            'Captures UI frame metrics + audio supervisor counters and exports a markdown snippet you can paste into docs/PERF_EVIDENCE.md.',
          )}
        </Text>
        <Box h={10} />
        <Button
          text={capturing ? 'Capturing…' : 'Capture + Share (10s)'}
          variant="primary"
          onPress={capture10sPerfEvidence}
          disabled={capturing || running}
          testID="btn-torture-capture"
        />
        {lastReportPath ? (
          <Text preset="muted" style={{ marginTop: 10 }} selectable>
            Last report: {lastReportPath.replace(FileSystem.documentDirectory ?? '', 'docs:/')}
          </Text>
        ) : null}
        {shareError ? (
          <Text preset="muted" style={{ marginTop: 8 }}>
            {shareError}
          </Text>
        ) : null}
      </Card>
    </Screen>
  )
}
