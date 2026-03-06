import React, { useEffect, useMemo, useRef, useState } from "react"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import { View } from "react-native"
import { onInterruption } from '@/core/audio/interruptions'
import { routeBroker } from '@/core/audio/routeBroker'
import type { RouteInfo } from '@/core/audio/routeManager'

import { Screen } from "@/ui/components/Screen"
import { Text } from "@/ui/components/Typography"
import { Button } from "@/ui/components/Button"
import { Card } from "@/ui/components/Card"
import { NextActionBar } from '@/ui/components/NextActionBar'
import { AudioRoutePill } from '@/ui/components/AudioRoutePill'
import { AudioInputPicker } from '@/ui/components/AudioInputPicker'
import { useTheme } from "@/theme/useTheme"

import type { RootStackParamList } from "../navigation/types"
import { loadAllBundledPacks } from "@/core/drills/loader"
import { describeDrill } from "@/core/drills/describe"
import { getDrillRunnerFor } from "@/core/drills/registry"
import { addAttemptAndUpdateBestTake } from "@/core/storage/attemptsRepo"
import { markTakeIndexed } from '@/core/storage/takeFilesRepo'
import { getSettings, upsertSettings } from "@/core/storage/settingsRepo"
import { hasPro } from '@/core/billing/entitlementsRepo'
import { getProfile, upsertProfile } from "@/core/storage/profileRepo"
import { finishSession } from "@/core/storage/sessionsRepo"
import { advancePlan, getPlan, markFail, resetFail } from "@/core/profile/sessionPlan"
import { Box } from '@/ui'
import { t } from '@/app/i18n'
import { useSoundPlayback } from '@/app/audio/useSoundPlayback'
import * as DocumentPicker from 'expo-document-picker'
import { playMandatoryReference } from '@/core/audio/referencePlayback'
import { RecordingOverlay, RecorderHUD } from '@/ui/patterns'
import { GhostGuideOverlay } from '@/ui/ghost'
import { useGhostOverlayFrame } from '@/ui/ghost/useGhostOverlayFrame'
import type { GhostGuideState } from '@/core/drills/runnerMachine'
import type { PitchReading } from '@/core/pitch/pitchEngine'
import { useSnackbar } from '@/ui/components/kit/Snackbar'
import { DrillAbortError } from '@/core/drills/drillExecutor'
import { track } from '@/app/telemetry'
import { captureException } from '@/app/telemetry/sentry'
import { getDailyChallenge, recordDailyChallengeAttempt } from '@/core/challenges/dailyChallenge'
import { getSessionMeta, setSessionMeta } from '@/core/profile/sessionMeta'
import { applyFeedbackPlanToDrill, isTransferLikeDrillId, resolveFeedbackPlan } from '@/core/coaching/feedbackPolicy'
import type { FeedbackPlan } from '@/core/coaching/feedbackPolicy'
import { loadCurriculum } from '@/core/curriculum/loader'
import { markDayCompleted } from '@/core/curriculum/progress'
import { finalizeChallengeSubmissionsForSession } from '@/core/challenges/finalize'
import { logger } from '@/core/observability/logger'

// NOTE: DrillScreen is the “gameplay” screen. Keep it fast.

type Props = NativeStackScreenProps<RootStackParamList, "Drill">

export function DrillScreen({ navigation, route }: Props) {
  const theme = useTheme()
  const snackbar = useSnackbar()
  const { sessionId, drillId } = route.params
  const pack = useMemo(() => loadAllBundledPacks(), [])
  const drill = useMemo(() => pack.drills.find((d) => d.id === drillId)!, [pack.drills, drillId])
  const demo = useSoundPlayback(drill?.demoUri)

  const description = (drill as any).description ?? describeDrill(drill)

  const [status, setStatus] = useState<"idle" | "referencing" | "running">("idle")
  const [customRefUri, setCustomRefUri] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [listenThenSing, setListenThenSing] = useState(true)
  const [ghostAdvanced, setGhostAdvanced] = useState(false)
  const [overlayMode, setOverlayMode] = useState<'full' | 'pill'>('full')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [activeFeedbackPlan, setActiveFeedbackPlan] = useState<FeedbackPlan | null>(null)


  // Reliability: if the app is backgrounded during an active drill, abort cleanly.
  useEffect(() => {
    return onInterruption((e) => {
      if (status !== 'running') return
      if (e.type === 'app_state' && e.to === 'active') return
      if (e.type === 'app_state' && e.to !== 'active') {
        const ctrl = abortRef.current
        if (ctrl && !ctrl.signal.aborted) ctrl.abort(new DrillAbortError('app_backgrounded'))
      }
      if (e.type === 'audio_session_error') {
        const ctrl = abortRef.current
        if (ctrl && !ctrl.signal.aborted) ctrl.abort(new DrillAbortError('audio_session_error'))
      }

      if (e.type === 'audio_route') {
        // Route changes mid-recording can corrupt capture or create mismatched latency.
        // Abort safely and let user resume after the route stabilizes.
        const startedAt = recordingStartMsRef.current
        if (!startedAt) return
        if (e.atMs < startedAt + 250) return // ignore initial priming events
        const ctrl = abortRef.current
        if (ctrl && !ctrl.signal.aborted) ctrl.abort(new DrillAbortError('audio_route_changed'))
      }
    })
  }, [status])

  // Ghost Guide UI state (throttled)
  const [ghostState, setGhostState] = useState<GhostGuideState | null>(null)
  const [audioRoute, setAudioRoute] = useState<RouteInfo | null>(null)
  const [showInputPicker, setShowInputPicker] = useState(false)
  const recordingStartMsRef = useRef<number | null>(null)
  const recordingRouteStartRef = useRef<RouteInfo | null>(null)
  const [routeChangedBanner, setRouteChangedBanner] = useState(false)
  const [routeChangedTo, setRouteChangedTo] = useState<RouteInfo | null>(null)
  const [ghostReading, setGhostReading] = useState<PitchReading | null>(null)
  const [ghostDiag, setGhostDiag] = useState<{ reason: string; frameRms?: number } | null>(null)
  const ghostFrame = useGhostOverlayFrame({ reading: ghostReading, drill: ghostState, fps: 20 })
  const lastGhostUiUpdate = useRef(0)

  useEffect(() => {
    if (status !== 'running') {
      setElapsedMs(0)
      setOverlayMode('full')
      setActiveFeedbackPlan(null)
      return
    }
    const started = Date.now()
    const id = setInterval(() => setElapsedMs(Date.now() - started), 250)
    return () => clearInterval(id)
  }, [status])

  const elapsedLabel = useMemo(() => {
    const totalSec = Math.floor(elapsedMs / 1000)
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0')
    const s = String(totalSec % 60).padStart(2, '0')
    return `${m}:${s}`
  }, [elapsedMs])

  const showGhostOverlay = useMemo(() => {
    if (status !== 'running') return false
    const p = activeFeedbackPlan
    if (!p) return true // default on for early sessions
    if (p.mode === 'OFF_POST') return false
    if (p.mode === 'FADED') {
      const fade = typeof p.fadeAfterSec === 'number' ? p.fadeAfterSec : 0.9
      return elapsedMs / 1000 <= fade
    }
    return true
  }, [status, activeFeedbackPlan, elapsedMs])

  const ghostOpacity = useMemo(() => {
    const p = activeFeedbackPlan
    if (!p) return 1
    if (p.mode === 'BANDWIDTH_ONLY') return 0.55
    if (p.mode === 'FADED') return 0.85
    return 1
  }, [activeFeedbackPlan])

  const plan = getPlan(sessionId)
  const progressPct = plan ? Math.round(((plan.index + 1) / plan.drillIds.length) * 100) : 0

  const bar = useSharedValue(progressPct)
  useEffect(() => {
    bar.value = withSpring(progressPct, { damping: 16, stiffness: 160 })
  }, [progressPct, bar])

  const barStyle = useAnimatedStyle(() => ({ width: `${bar.value}%` }))

  useEffect(() => {
    ;(async () => {
      const s = await getSettings().catch(() => null)
      if (s) setListenThenSing(!!s.listenThenSing)
      const pro = await hasPro().catch(() => false)
      setGhostAdvanced(!!(pro && s?.ghostAdvanced))
    })()
  }, [])

  useEffect(() => {
    const unsub = routeBroker.subscribe((s) => {
      setAudioRoute(s.route as any)
      if (status !== 'running') return
      // Capture the "changed-to" route so we can show a recovery CTA after abort.
      const start = recordingRouteStartRef.current
      if (!s.route) return
      const changed = !start || start.routeType !== s.route.routeType || start.inputUid !== s.route.inputUid
      if (changed) setRouteChangedTo(s.route)
    })
    return () => unsub()
  }, [status])

  const run = async () => {
    // Safety: demo playback must not compete with recording.
    if (demo.isPlaying) {
      demo.unload().catch((e: unknown) => logger.warn('demo unload failed', { error: e }))
    }

    // Mandatory reference step: listen then match.
    setStatus('referencing')
    try {
      await playMandatoryReference(drill, { overrideUri: customRefUri })
    } catch (e: unknown) {
      logger.warn('reference playback failed', { error: e })
      // Fail open: if reference fails, still allow recording.
    }
    // 1s “Ready…” beat.
    await new Promise((r) => setTimeout(r, 1000))

    setStatus("running")
    const ctrl = new AbortController()
    abortRef.current = ctrl
    recordingStartMsRef.current = Date.now()
    recordingRouteStartRef.current = routeBroker.getState().route ?? audioRoute
    setRouteChangedBanner(false)
    setRouteChangedTo(null)
    track('drill_start', { sessionId, drillId })
    try {
      const settings = await getSettings()

      // Store-friendly primer: explain why mic permission is needed before the first recording.
      if (!settings.qaBypassMicPermission && !settings.seenMicPrimer) {
        setStatus('idle')
        ;(navigation as any).navigate('PermissionsPrimer', {
          kind: 'mic',
          next: { name: 'Drill', params: { sessionId, drillId } },
        })
        return
      }

      const profile = await getProfile()

      const sessionMeta = getSessionMeta(sessionId)
      const segment = isTransferLikeDrillId(drillId) ? 'transfer' : 'core'
      const effectivePlan = resolveFeedbackPlan({
        track: (sessionMeta?.track as any) ?? (settings?.activeTrack as any) ?? 'beginner',
        week: sessionMeta?.week ?? (sessionMeta?.day ? Math.ceil(sessionMeta.day / 7) : 1),
        base: (sessionMeta as any)?.baseFeedbackPlan ?? sessionMeta?.feedbackPlan ?? null,
        segment,
      })

      setActiveFeedbackPlan(effectivePlan)

      // Persist for other modules that still read meta.feedbackPlan (legacy).
      if (sessionMeta) setSessionMeta(sessionId, { ...sessionMeta, feedbackPlan: effectivePlan })

      const effectiveDrill = applyFeedbackPlanToDrill(drill, effectivePlan)

      const runner = getDrillRunnerFor(drill.type)
      const res = await runner.run({
        drill: effectiveDrill,
        settings,
        profile,
        abortSignal: ctrl.signal,
        onGhostFrame: (ev: any) => {
          const now = Date.now()
          if (now - lastGhostUiUpdate.current < 66) return // ~15fps UI updates
          lastGhostUiUpdate.current = now
          setGhostState(ev?.ghost ?? null)
          setGhostReading(ev?.reading ?? null)
          setGhostDiag(ev?.diag ?? null)
        },
      } as any)

      // If permission denied, do NOT persist an attempt. Let user fix permissions.
      if ((res as any)?.metrics?.error === 'mic_permission_denied') {
        setStatus('idle')
        return
      }

      const mergedMetrics = {
        ...(res.metrics ?? {}),
        recording: {
          ...(res.metrics as any)?.recording,
          livePeak: (res.metrics as any)?.recordingStats?.peakMax ?? null,
          liveClipped: ((res.metrics as any)?.recordingStats?.clippedFrames ?? 0) > 0,
          routeStart: recordingRouteStartRef.current
            ? {
                routeType: recordingRouteStartRef.current.routeType,
                inputName: recordingRouteStartRef.current.inputName,
                inputUid: recordingRouteStartRef.current.inputUid,
                sampleRateHz: recordingRouteStartRef.current.sampleRateHz,
                ioBufferDurationMs: recordingRouteStartRef.current.ioBufferDurationMs,
                channels: recordingRouteStartRef.current.channels,
                isBluetoothInput: recordingRouteStartRef.current.isBluetoothInput,
              }
            : null,
          routeEnd: (routeBroker.getState().route ?? audioRoute)
            ? {
                routeType: (routeBroker.getState().route ?? audioRoute)!.routeType,
                inputName: (routeBroker.getState().route ?? audioRoute)!.inputName,
                inputUid: (routeBroker.getState().route ?? audioRoute)!.inputUid,
                sampleRateHz: (routeBroker.getState().route ?? audioRoute)!.sampleRateHz,
                ioBufferDurationMs: (routeBroker.getState().route ?? audioRoute)!.ioBufferDurationMs,
                channels: (routeBroker.getState().route ?? audioRoute)!.channels,
                isBluetoothInput: (routeBroker.getState().route ?? audioRoute)!.isBluetoothInput,
              }
            : null,
          captureConfig: {
            allowBluetoothMic: !!(settings as any)?.allowBluetoothMic,
            preferBuiltInMic: !!(settings as any)?.preferBuiltInMic,
            preferredInputUid: (settings as any)?.preferredInputUid ?? null,
          },
        },
      }

      const { attempt } = await addAttemptAndUpdateBestTake({
        sessionId,
        drillId,
        score: res.score,
        metrics: mergedMetrics,
      }).catch((e) => {
        // Attempt persistence is critical. If this fails, surface it.
        captureException(e, { kind: 'persist_attempt', sessionId, drillId })
        throw e
      })

      track('drill_complete', { sessionId, drillId, score: res.score })

      // Data safety: if this attempt produced an audio take, mark it indexed so
      // recovery UI can distinguish "saved but not attached" takes.
      const audioUri = (mergedMetrics as any)?.audioUri as string | undefined
      if (audioUri) {
        await markTakeIndexed(audioUri, {
          attemptId: attempt.id,
          sessionId,
          drillId,
          meta: {
            audioSampleRate: (mergedMetrics as any)?.audioSampleRate,
            audioDurationMs: (mergedMetrics as any)?.audioDurationMs,
          },
        }).catch((e: unknown) => logger.warn('startRecording failed', { error: e }))
      }

      // Daily Challenge: record best as soon as the challenge drill is attempted.
      const challengeMeta = getSessionMeta(sessionId)
      if (challengeMeta?.dailyChallenge) {
        try {
          const c = getDailyChallenge()
          if (drillId === c.drillId) await recordDailyChallengeAttempt(res.score)
        } catch {}
      }

    // Update profile (on-device stats)
    if (res.profileDelta) {
      await upsertProfile({ ...profile, ...res.profileDelta, updatedAt: Date.now() })
    }

    // Adaptive fail streaks (helps mission routing later)
    if (res.score < 60) markFail(sessionId, drillId)
    else resetFail(sessionId, drillId)

    // Session plan progression
    const p2 = advancePlan(sessionId)
    let nextDrillId = p2 && p2.index < p2.drillIds.length ? p2.drillIds[p2.index] : undefined

    // Smart "repair" routing: if the plan ended but the user struggled, suggest a corrective drill
    // instead of dumping them into Results.
    if (!nextDrillId && res.score < 70) {
      try {
        const { loadAllBundledPacks } = await import('@/core/drills/loader')
        const { pickNextDrill } = await import('@/core/profile/nextDrill')
        const pack = loadAllBundledPacks()
        nextDrillId = pickNextDrill(pack, profile, { lastDrillId: drillId, lastScore: res.score })
      } catch {}
    }

    const endToResults = !nextDrillId

    if (endToResults) {
      // Retention hooks: curriculum progression + daily challenge recording.
      const meta = getSessionMeta(sessionId)

      if (meta?.curriculumDayId) {
        try {
          const curr = loadCurriculum((settings?.activeCurriculum ?? 'phase1') as any, (settings?.activeTrack ?? 'beginner') as any)
          await markDayCompleted(curr, meta.curriculumDayId)
        } catch {}
      }

      // Challenges: persist a submission for leaderboards (offline-first).
      try {
        await finalizeChallengeSubmissionsForSession(sessionId)
      } catch {}

      // 7-Day Pitch Lock challenge: complete today's day when the session ends.
      try {
        const { getChallengeState, getTodayChallengeDay, completeChallengeDay } = await import('@/core/challenges/pitchLockChallenge')
        const st = await getChallengeState()
        const day = getTodayChallengeDay(st)
        await completeChallengeDay(day, res.score)
      } catch {}
      await finishSession(sessionId, res.tip, res.summary)
    }

      navigation.replace("DrillResult", {
        sessionId,
        drillId,
        attemptId: attempt.id,
        nextDrillId,
        endToResults,
      })
    } catch (e: any) {
      if (e?.name === 'DrillAbortError' || e instanceof DrillAbortError) {
        const reason = (e as any)?.reason ?? (e as any)?.message ?? 'drill_aborted'
        if (reason === 'audio_route_changed') {
          setRouteChangedBanner(true)
          snackbar.show(t('drill.routeChanged'))
        } else {
          // Cancel is a user action; no modal.
          snackbar.show(t('drill.cancelled'))
        }
        track('drill_cancel', { sessionId, drillId })
      } else {
        captureException(e, { kind: 'drill_run', sessionId, drillId })
        snackbar.show(e?.message ?? t('common.tryAgain'))
      }
      setStatus("idle")
    } finally {
      abortRef.current = null
      setGhostState(null)
      setGhostReading(null)
    }
  }

  const pickCustomReference = async () => {
    // “Song bridge”: let the user practice with their own audio without licensing.
    const res = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: ['audio/*'],
      multiple: false,
    })
    if (res.canceled) return
    const uri = (res as any).assets?.[0]?.uri
    if (uri) setCustomRefUri(uri)
  }

  const stop = () => {
    abortRef.current?.abort()
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Text preset="h1">{drill.title}</Text>
        <Text preset="muted">{description}</Text>

        <AudioRoutePill route={audioRoute} onPress={() => setShowInputPicker(true)} />

        {drill.demoUri ? (
          <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <Button
              text={demo.isPlaying ? (t('common.pause') ?? 'Pause demo') : (t('common.play') ?? 'Play demo')}
              variant="soft"
              onPress={() => demo.toggle()}
              disabled={status !== 'idle'}
            />
            <Text preset="muted">{demo.progressLabel}</Text>
          </Box>
        ) : null}

        <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
          <Button
            text={customRefUri ? (t('drill.reference.customSelected') ?? 'Custom reference selected') : (t('drill.reference.useMyAudio') ?? 'Use my audio as reference')}
            variant="ghost"
            onPress={pickCustomReference}
            disabled={status !== 'idle'}
          />
          {customRefUri ? <Text preset="muted">{t('drill.reference.customHint') ?? 'We will play it first, then start recording.'}</Text> : null}
        </Box>

        {status === 'referencing' ? (
          <Card tone="elevated" style={{ marginTop: 10 }}>
            <Text preset="h2">{t('drill.reference.title') ?? 'Listen & match'}</Text>
            <Text preset="muted">{t('drill.reference.body') ?? 'We’ll play a reference, then you sing it back.'}</Text>
            <Box style={{ height: 8 }} />
            <Text preset="muted">{t('drill.reference.ready') ?? 'Ready…'}</Text>
          </Card>
        ) : null}

        {routeChangedBanner ? (
          <Card tone="glow" style={{ marginTop: 6 }}>
            <Text preset="h2">{t('drill.routeChangedTitle')}</Text>
            <Text preset="muted">
              {t('drill.routeChangedBody', {
                to: routeChangedTo?.inputName ?? routeChangedTo?.routeType ?? 'unknown',
              })}
            </Text>
            <Box style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <Button text={t('drill.resume')} onPress={run} />
              <Button text={t('drill.chooseMic')} variant="ghost" onPress={() => setShowInputPicker(true)} />
            </Box>
          </Card>
        ) : null}

        {plan ? (
          <Box style={{ gap: 6, marginTop: 4 }}>
            <Text preset="muted">{t('drill.step', { step: plan.index + 1, total: plan.drillIds.length, pct: progressPct })}</Text>
            <Box style={{ height: 10, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.10)", overflow: "hidden" }}>
              <Animated.View style={[{ height: 10 }, barStyle]}>
                <LinearGradient colors={theme.gradients.primary as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 10 }} />
              </Animated.View>
            </Box>
          </Box>
        ) : null}
      </Box>

      <Card tone="glow">
        <Text preset="h2">{t('drill.howItWorksTitle')}</Text>
        <Text preset="muted">{listenThenSing ? t('drill.listenThenSingOn') : t('drill.listenThenSingOff')}</Text>
        <Button text={status === 'running' ? t('drill.listening') : t('common.start')} disabled={status === "running"} onPress={run} testID="btn-drill-start" />
      </Card>

      <AudioInputPicker
        visible={showInputPicker}
        onClose={() => setShowInputPicker(false)}
        currentUid={audioRoute?.inputUid ?? null}
        onSelected={async (uid) => {
          try {
            const s = await getSettings()
            await upsertSettings({ ...s, preferredInputUid: uid })
          } catch (e) {
            captureException(e, { kind: 'set_preferred_input', sessionId, drillId })
          }
        }}
      />

      <Button text={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} testID="btn-drill-back" />

      {/* UI-only overlays (no runner business logic inside). */}
      <RecordingOverlay
        visible={status === 'running'}
        mode={overlayMode}
        elapsedLabel={elapsedLabel}
        onMinimize={() => setOverlayMode((m) => (m === 'full' ? 'pill' : 'full'))}
        onStop={stop}
        testID="recording-overlay"
      >
        {/* Ghost Guide highway (Aurora).
            Track policy can fade/disable this overlay to build transfer independence.
            RecordingOverlay already removes it when minimized to pill. */}
        {showGhostOverlay ? (
          <View style={{ opacity: ghostOpacity }}>
            <GhostGuideOverlay {...ghostFrame} advanced={ghostAdvanced} />
          </View>
        ) : null}

        {/* Confidence-first UX: if pitch cannot be detected, guide the user instead of silently failing. */}
        {ghostDiag?.reason && ghostDiag.reason !== 'ok' ? (
          <Box
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              top: 16,
              padding: 12,
              borderRadius: 14,
              backgroundColor: 'rgba(0,0,0,0.48)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.10)',
            }}
          >
            <Text preset="caption" style={{ opacity: 0.95 }}>
              {ghostDiag.reason === 'too_quiet'
                ? t('drill.diag.tooQuiet')
                : t('drill.diag.lowConfidence')}
            </Text>
          </Box>
        ) : null}
      </RecordingOverlay>
      {status === 'running' && overlayMode === 'pill' ? <RecorderHUD elapsedLabel={elapsedLabel} testID="recorder-hud" /> : null}
      {status !== 'running' ? (
        <NextActionBar
          title={t('nextAction.readyTitle')}
          subtitle={t('nextAction.readySubtitle')}
          primaryLabel={t('nextAction.startDrill')}
          onPrimary={run}
          secondaryLabel={t('nextAction.backHome')}
          onSecondary={() => navigation.navigate('MainTabs')}
          testID="next.action.drill"
          primaryTestID="btn-next-start-drill"
          secondaryTestID="btn-next-back-home"
        />
      ) : null}
    </Screen>
  )
}
