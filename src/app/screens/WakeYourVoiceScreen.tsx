import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Box } from '@/ui'
import { Screen } from '@/ui/components/Screen'
import { Text } from '@/ui/components/Typography'
import type { RootStackParamList } from '../navigation/types'
import { BrandWorldBackdrop, ConfidenceIndicator, CurrentZoneChip, EnvironmentChip, HexagonStateRenderer, InlineRecoveryCard, LivePitchTrace, PrimaryActionBar, RangeRail, RewardBurst, StabilityMeter } from '@/ui/guidedJourney'
import { ensureMicPermission, startMic, type MicHandle } from '@/core/audio/micStream'
import { PitchTruth } from '@/core/pitch/pitchTruth'
import { pcmBase64ToFloat32, rms } from '@/core/audio/pcm'
import { probeAudioInputFormat } from '@/core/audio/audioFormatProbe'
import { getSettings, upsertSettings } from '@/core/storage/settingsRepo'
import { getCurrentRoute } from '@/core/audio/routeManager'
import { hzToNote } from '@/core/pitch/hzToNote'
import { id } from '@/core/util/id'
import { buildFirstWinSnapshot } from '@/core/guidedJourney/placement'
import { getVoiceIdentity, upsertVoiceIdentity } from '@/core/guidedJourney/voiceIdentityRepo'
import { startJourneyFromPlacement } from '@/core/guidedJourney/progress'
import { track } from '@/app/telemetry'

type Props = NativeStackScreenProps<RootStackParamList, 'WakeYourVoice'>

type FirstWinPhase = 'room_read' | 'wake_core' | 'rise_with_light' | 'hold_the_light' | 'mini_first_win'

const phaseOrder: FirstWinPhase[] = ['room_read', 'wake_core', 'rise_with_light', 'hold_the_light', 'mini_first_win']
const uiCopy = {
  title: 'Wake your voice',
  subtitle: 'A tiny guided win, then we place you into the right chapter.',
}

export function WakeYourVoiceScreen({ navigation }: Props) {
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<FirstWinPhase>('room_read')
  const [trace, setTrace] = useState<number[]>([])
  const [currentNote, setCurrentNote] = useState<string>('Ready')
  const [ambientNoise, setAmbientNoise] = useState(0)
  const [confidence, setConfidence] = useState(0)
  const [stability, setStability] = useState(0)
  const [pitchBand, setPitchBand] = useState<{ low: number | null; high: number | null }>({ low: null, high: null })
  const [issue, setIssue] = useState<null | 'noVoice' | 'tooQuiet' | 'tooLoud' | 'noisyRoom' | 'audioSetup'>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [rewardOn, setRewardOn] = useState(false)

  const micRef = useRef<MicHandle | null>(null)
  const engineRef = useRef<PitchTruth | null>(null)
  const phaseStartedAt = useRef(0)
  const roomSamplesRef = useRef<number[]>([])
  const riseMidisRef = useRef<number[]>([])
  const holdCentsRef = useRef<number[]>([])
  const currentHoldStartedAt = useRef<number | null>(null)
  const longestHoldMsRef = useRef(0)
  const timeToFirstVoiceMsRef = useRef<number | null>(null)
  const voicedFramesRef = useRef(0)
  const loudnessRef = useRef<number[]>([])
  const clippingMaxRef = useRef(0)

  useEffect(() => {
    return () => {
      void stopCapture()
    }
  }, [])

  const phaseIndex = phaseOrder.indexOf(phase)
  const progress = (phaseIndex + 1) / phaseOrder.length

  const phaseCopy = useMemo(() => {
    switch (phase) {
      case 'room_read':
        return {
          title: 'Room read',
          body: 'Stay quiet for a moment while we listen to the room, not you.',
          helper: 'Magical, not clinical. We are only finding your cleanest starting point.',
          state: 'listening' as const,
          env: ambientNoise > 0.045 ? 'A little noisy' : 'Room looks ready',
        }
      case 'wake_core':
        return {
          title: 'Wake the core',
          body: 'Say or sing a relaxed “ahh”. A clear easy sound is enough.',
          helper: 'We are looking for your first honest signal, not your biggest note.',
          state: 'voiceDetected' as const,
          env: 'Listening for you',
        }
      case 'rise_with_light':
        return {
          title: 'Rise with the light',
          body: 'Let the note float a little higher, then let it settle.',
          helper: 'Small movement is perfect. This is not a range test.',
          state: 'tracking' as const,
          env: 'Tracking comfort',
        }
      case 'hold_the_light':
        return {
          title: 'Hold the light',
          body: 'Find one note that feels easy and hold it steady.',
          helper: 'A shorter calm hold beats a tense long one.',
          state: 'locked' as const,
          env: 'Looking for stability',
        }
      default:
        return {
          title: 'Mini first win',
          body: 'You did it. We have enough to start your journey.',
          helper: 'We are turning this into your first chapter now.',
          state: 'success' as const,
          env: 'First win captured',
        }
    }
  }, [phase, ambientNoise])

  const startFlow = async () => {
    setIssue(null)
    setRewardOn(false)
    setPhase('room_read')
    setTrace([])
    setCurrentNote('Ready')
    setConfidence(0)
    setStability(0)
    setPitchBand({ low: null, high: null })
    roomSamplesRef.current = []
    riseMidisRef.current = []
    holdCentsRef.current = []
    currentHoldStartedAt.current = null
    longestHoldMsRef.current = 0
    timeToFirstVoiceMsRef.current = null
    voicedFramesRef.current = 0
    loudnessRef.current = []
    clippingMaxRef.current = 0

    const ok = await ensureMicPermission()
    if (!ok) {
      navigation.replace('Recovery', { reason: 'micDenied', next: { name: 'WakeYourVoice' } })
      return
    }

    const settings = await getSettings()
    const fmt = await probeAudioInputFormat().catch(() => ({ sampleRate: 44100, channels: 1 as const, bufferDurationMs: 10 }))
    engineRef.current = new PitchTruth({
      sampleRate: fmt.sampleRate,
      noiseGateRms: settings.noiseGateRms ?? 0.02,
      minConfidence: 0.35,
      noteChangeConfirmFrames: 2,
    })

    phaseStartedAt.current = Date.now()
    setRunning(true)
    track('first_win_started', { source: 'guided_journey_v3' } as any)

    micRef.current = await startMic(
      { sampleRate: fmt.sampleRate, frameDurationMs: 20 },
      (event) => {
        const now = Date.now()
        const frame = pcmBase64ToFloat32(event.pcmBase64)
        const frameRms = rms(frame)
        const framePeak = engineRef.current?.getLastFramePeak() ?? 0
        clippingMaxRef.current = Math.max(clippingMaxRef.current, framePeak)
        const reading = engineRef.current?.pushPcmBase64(event.pcmBase64) ?? null

        if (phase === 'room_read') roomSamplesRef.current.push(frameRms)

        if (reading) {
          voicedFramesRef.current += 1
          if (timeToFirstVoiceMsRef.current == null) timeToFirstVoiceMsRef.current = now - phaseStartedAt.current
          loudnessRef.current.push(frameRms)
          setCurrentNote(reading.note)
          setConfidence(reading.confidence)
          setTrace((prev) => [...prev.slice(-31), clampTrace((reading.cents + 50) / 100)])
          const midi = hzToNote(reading.freqHz).midi
          setPitchBand((prev) => ({
            low: prev.low == null ? midi : Math.min(prev.low, midi),
            high: prev.high == null ? midi : Math.max(prev.high, midi),
          }))

          if (phase === 'rise_with_light') riseMidisRef.current.push(midi + reading.cents / 100)
          if (phase === 'hold_the_light') {
            holdCentsRef.current.push(reading.cents)
            setStability(stddev(holdCentsRef.current.slice(-24)))
            if (Math.abs(reading.cents) <= 28) {
              if (currentHoldStartedAt.current == null) currentHoldStartedAt.current = now
              longestHoldMsRef.current = Math.max(longestHoldMsRef.current, now - currentHoldStartedAt.current)
            } else {
              currentHoldStartedAt.current = null
            }
          }
        }

        const elapsed = now - phaseStartedAt.current
        if (phase === 'room_read' && elapsed >= 1800) {
          const avgNoise = mean(roomSamplesRef.current)
          setAmbientNoise(avgNoise)
          if (avgNoise > 0.06) {
            setIssue('noisyRoom')
            void stopCapture()
            return
          }
          advancePhase('wake_core')
          return
        }

        if (phase === 'wake_core' && timeToFirstVoiceMsRef.current != null && voicedFramesRef.current >= 4) {
          advancePhase('rise_with_light')
          return
        }
        if (phase === 'wake_core' && elapsed > 3800) {
          setIssue(frameRms < 0.02 ? 'tooQuiet' : 'noVoice')
          void stopCapture()
          return
        }

        if (phase === 'rise_with_light' && (elapsed > 4200 || span(riseMidisRef.current) >= 3.5)) {
          advancePhase('hold_the_light')
          return
        }

        if (phase === 'hold_the_light' && (elapsed > 4200 || longestHoldMsRef.current >= 1400)) {
          setRewardOn(true)
          advancePhase('mini_first_win')
          void finalizeFirstWin()
        }
      },
      () => {
        setIssue('audioSetup')
        void stopCapture()
      },
    ).catch(() => null)
  }

  const finalizeFirstWin = async () => {
    const settings = await getSettings()
    const voiceIdentity = await getVoiceIdentity()
    const route = await getCurrentRoute().catch(() => null)
    const avgLoudness = mean(loudnessRef.current)
    const snapshot = buildFirstWinSnapshot({
      id: id('fw'),
      createdAt: Date.now(),
      permissionGranted: true,
      ambientNoiseFloor: mean(roomSamplesRef.current),
      clippingRisk: clippingMaxRef.current > 0.97 ? 'high' : clippingMaxRef.current > 0.9 ? 'medium' : 'low',
      deviceRouteType: route?.routeType ?? null,
      timeToFirstVocalResponseMs: timeToFirstVoiceMsRef.current,
      loudnessComfort: avgLoudness > 0.14 ? 'strong' : avgLoudness < 0.03 ? 'quiet' : 'comfortable',
      roughComfortablePitchBand: { lowMidi: pitchBand.low, highMidi: pitchBand.high },
      glideSuccess: clampTrace(span(riseMidisRef.current) / 5) * monotonicity(riseMidisRef.current),
      sustainDurationMs: longestHoldMsRef.current,
      sustainStability: stddev(holdCentsRef.current.slice(-28)),
      retryCount,
      coachingMode: settings.coachingMode ?? voiceIdentity.coachingMode,
      onboardingIntent: settings.onboardingIntent ?? voiceIdentity.onboardingIntent,
    })

    await upsertSettings({
      ...settings,
      firstWinComplete: true,
      firstWinVersion: 3,
      onboardingComplete: true,
      routeHint: snapshot.placement.routeId,
      hasCalibrated: true,
      noiseGateRms: settings.noiseGateRms ?? Math.max(0.02, snapshot.ambientNoiseFloor * 2.1),
    })

    await upsertVoiceIdentity({
      ...voiceIdentity,
      updatedAt: Date.now(),
      coachingMode: settings.coachingMode ?? voiceIdentity.coachingMode,
      onboardingIntent: settings.onboardingIntent ?? voiceIdentity.onboardingIntent,
      firstWinComplete: true,
      firstWinVersion: 3,
      firstWinSnapshot: snapshot,
      comfortZone: snapshot.roughComfortablePitchBand,
      likelyFamily: {
        label: snapshot.placement.likelyFamily ?? null,
        confidence: snapshot.placement.likelyFamilyConfidence ?? 0,
      },
      strengths: [
        snapshot.sustainDurationMs >= 1200 ? 'You can already hold a calm note.' : 'You showed up and gave us a real signal.',
        snapshot.glideSuccess >= 0.55 ? 'Your voice follows motion well.' : 'Your safest win is settling one note at a time.',
      ],
      currentFocus: [
        snapshot.placement.routeId === 'R2' ? 'Pitch entry and interval control' : snapshot.placement.routeId === 'R3' ? 'Short reps that build confidence' : 'Clean note matching and easy stability',
      ],
    })

    await startJourneyFromPlacement(snapshot.placement.routeId, snapshot.id)
    await stopCapture()
    navigation.replace('FirstWinResult', { lessonId: snapshot.placement.lessonId, snapshotId: snapshot.id })
  }

  const stopCapture = async () => {
    setRunning(false)
    await micRef.current?.stop().catch(() => {})
    micRef.current = null
  }

  const advancePhase = (next: FirstWinPhase) => {
    phaseStartedAt.current = Date.now()
    setPhase(next)
  }

  return (
    <Screen scroll background="hero">
      <BrandWorldBackdrop />
      <RewardBurst active={rewardOn} />
      <Box style={{ gap: 16 }}>
        <Text preset="h1">{uiCopy.title}</Text>
        <Text preset="muted">{uiCopy.subtitle}</Text>

        <Box style={{ gap: 10 }}>
          <EnvironmentChip state={issue === 'noisyRoom' ? 'noisy' : phaseCopy.state === 'listening' ? 'listening' : phaseCopy.state === 'success' ? 'ready' : 'ready'} label={phaseCopy.env} />
          <Text preset="h2">{phaseCopy.title}</Text>
          <Text preset="body">{phaseCopy.body}</Text>
          <Text preset="muted">{phaseCopy.helper}</Text>
          <RangeRail minLabel="Start" maxLabel="Win" progress={progress} />
        </Box>

        <HexagonStateRenderer
          state={issue ? 'needsRetry' : phaseCopy.state}
          title={phase === 'mini_first_win' ? 'First win captured' : currentNote}
          subtitle={phase === 'room_read' ? 'Listening to the room' : phase === 'hold_the_light' ? `${Math.round(longestHoldMsRef.current / 100) / 10}s steady` : 'Your guide object follows the moment'}
          progress={progress}
        />

        <LivePitchTrace values={trace} />
        <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <CurrentZoneChip label={pitchBand.low != null && pitchBand.high != null ? `${pitchBand.low}–${pitchBand.high} midi` : 'Comfort zone warming up'} />
          <CurrentZoneChip label={currentNote} />
        </Box>
        <StabilityMeter value={stability} />
        <ConfidenceIndicator value={confidence} />

        {issue ? (
          <InlineRecoveryCard
            title={issue === 'noVoice' ? 'We did not catch a clear voice yet.' : issue === 'tooQuiet' ? 'A little more sound will help.' : issue === 'tooLoud' ? 'A softer note will track better.' : issue === 'noisyRoom' ? 'This room is a little noisy.' : 'We hit an audio setup snag.'}
            body={issue === 'noisyRoom' ? 'Try a quieter corner, then restart this tiny warm-up.' : 'You can retry right away. We only need a clean, comfortable sound.'}
            action="Retry the first win"
            onPress={() => {
              setRetryCount((count) => count + 1)
              void startFlow()
            }}
          />
        ) : null}

        {!running ? (
          <PrimaryActionBar
            primaryLabel={retryCount ? 'Try again' : 'Start voice check'}
            onPrimary={() => void startFlow()}
            secondaryLabel="Retune instead"
            onSecondary={() => navigation.navigate('Recovery', { reason: 'retune', next: { name: 'WakeYourVoice' } })}
            helperText="No diagnosis dump. Just one guided win."
          />
        ) : null}
      </Box>
    </Screen>
  )
}

function mean(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function span(values: number[]) {
  if (!values.length) return 0
  return Math.max(...values) - Math.min(...values)
}

function stddev(values: number[]) {
  if (values.length < 2) return 0
  const avg = mean(values)
  const variance = mean(values.map((value) => (value - avg) ** 2))
  return Math.sqrt(variance)
}

function monotonicity(values: number[]) {
  if (values.length < 3) return 0.4
  let positive = 0
  let total = 0
  for (let index = 1; index < values.length; index += 1) {
    const delta = values[index] - values[index - 1]
    if (Math.abs(delta) < 0.02) continue
    total += 1
    if (delta >= -0.02) positive += 1
  }
  return total ? positive / total : 0.4
}

function clampTrace(value: number) {
  return Math.max(0, Math.min(1, value))
}
