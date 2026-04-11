import React, { useEffect, useState } from "react"
import { I18nManager, Platform, Share } from 'react-native'
import { CompositeScreenProps } from "@react-navigation/native"
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Screen } from "@/ui/components/Screen"
import { Text } from "@/ui/components/Typography"
import { Button } from "@/ui/components/Button"
import { Card } from "@/ui/components/Card"
import { t, setLocale } from "@/app/i18n"
import { formatNumber } from '@/core/i18n'
import type { MainTabParamList, RootStackParamList } from "../navigation/types"
import { getSettings, upsertSettings, type Settings } from "@/core/storage/settingsRepo"
import { Box, Pressable } from '@/ui'
import { getBreadcrumbs } from '@/app/telemetry'
import { reportUiError } from '@/app/telemetry/report'
import { syncReminderSettings } from '@/app/notifications/reminders'
import { hasPro } from '@/core/billing/entitlementsRepo'
import { setCrashReportingEnabled } from '@/app/telemetry/consent'
import {
  isStoreBuild,
  enableCloud,
  enableSocial,
  enableInvites,
  enableCompetitions,
  enableMarketplace,
  enableDiagnostics,
} from '@/core/config/flags'
import { getRecentLogs } from '@/core/observability/logger'
import { getLastInterruption } from '@/core/audio/interruptions'
import { probeAudioInputFormat } from '@/core/audio/audioFormatProbe'
import { getQualityState } from '@/core/perf/qualityRuntime'

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Settings">,
  NativeStackScreenProps<RootStackParamList>
>

const LANGS: Settings["language"][] = ["en", "zu", "xh", "af", "st", "tn", "ts", "nso", "ve", "nr"]

export function SettingsScreen({ navigation }: Props) {
  const [s, setS] = useState<Settings | null>(null)
  const [pro, setPro] = useState(false)
  const [devTap, setDevTap] = useState(0)
  const showDev = __DEV__ && devTap >= 7
  const showDiag = enableDiagnostics() && devTap >= 10

  const storeBuild = isStoreBuild()
  const cloudOn = enableCloud()
  const socialOn = enableSocial()
  const invitesOn = enableInvites()
  const competitionsOn = enableCompetitions()
  const marketplaceOn = enableMarketplace()

  const shareDebug = async () => {
    const breadcrumbs = getBreadcrumbs().slice(-25)
    const sinceMs = Date.now() - 30_000
    const recentLogs = getRecentLogs({ sinceMs, limit: 220 })
    const lastInterruption = getLastInterruption()
    const audioFormat = await probeAudioInputFormat().catch(() => null)
    const quality = getQualityState()
    const payload = {
      at: new Date().toISOString(),
      platform: Platform.OS,
      locale: s?.language,
      settings: s,
      breadcrumbs,
      audio: {
        lastInterruption,
        audioFormat,
        quality,
      },
      recentLogs,
    }
    const message = JSON.stringify(payload, null, 2)
    await Share.share({ message, title: t('dev.debugExportTitle') }).catch(() => {})
  }

  const toggleRtl = async () => {
    try {
      const next = !I18nManager.isRTL
      I18nManager.allowRTL(true)
      I18nManager.forceRTL(next)
      const Updates = await import('expo-updates')
      await Updates.reloadAsync()
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    getSettings()
      .then((next) => {
        setS(next)
        setLocale(next.language)
      })
      .catch((e) => reportUiError(e, { screen: 'Settings' }))
    hasPro().then(setPro).catch(() => setPro(false))
  }, [])

  const update = async (next: Settings) => {
    const prev = s ?? next
    let final = next
    try {
      const reminderTouched =
        (prev.remindersEnabled ?? false) !== (next.remindersEnabled ?? false) ||
        (prev.reminderHour ?? 19) !== (next.reminderHour ?? 19) ||
        (prev.reminderMinute ?? 0) !== (next.reminderMinute ?? 0) ||
        (!!next.remindersEnabled && !next.reminderNotificationId)

      if (reminderTouched) {
        // Keep the OS schedule in sync.
        final = await syncReminderSettings(prev, next, {
          title: t('notifications.reminderTitle'),
          body: t('notifications.reminderBody'),
        })
      }
    } catch {
      // ignore
    }
    setS(final)
    await upsertSettings(final)
    setLocale(final.language)
  }

  if (!s) {
    return (
      <Screen background="gradient">
        <Text preset="h1">{t('settings.title')}</Text>
        <Text preset="muted">{t('settings.loading')}</Text>
      </Screen>
    )
  }

  return (
    <Screen scroll background="gradient">
      <Box style={{ gap: 6 }}>
        <Pressable
          testID="tap-settings-title"
          accessibilityRole="button"
          accessibilityLabel={t('settings.title')}
          onPress={() => setDevTap((x) => x + 1)}
        >
          <Text preset="h1">{t('settings.title')}</Text>
        </Pressable>
        <Text preset="muted">{t('settings.subtitle')}</Text>
      </Box>

      <Card tone="elevated">
        <Text preset="h2">{t('settings.calibrationTitle')}</Text>
        <Text preset="muted">{t('settings.calibrationSubtitle')}</Text>
        <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <Button text={t('settings.recalibrate')} onPress={() => (navigation as any).getParent()?.navigate('Calibration')} />
          <Button text={t('micTest.title') ?? 'Test mic'} variant="soft" onPress={() => (navigation as any).getParent()?.navigate('MicTest')} />
        </Box>
      </Card>

      {cloudOn && !storeBuild ? (
        <Card tone="glow">
          <Text preset="h2">{t('settings.accountTitle')}</Text>
          <Text preset="muted">{t('settings.accountSubtitle')}</Text>
          <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <Button text={t('settings.openAccount')} onPress={() => (navigation as any).getParent()?.navigate('Account')} />
            <Button text={t('settings.syncNow')} variant="soft" onPress={() => (navigation as any).getParent()?.navigate('Account')} />
          </Box>
        </Card>
      ) : null}

      {socialOn && !storeBuild ? (
        <Card>
          <Text preset="h2">{t('settings.communityTitle')}</Text>
          <Text preset="muted">{t('settings.communitySubtitle')}</Text>
          <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <Button text={t('settings.openMissions')} variant="soft" onPress={() => (navigation as any).getParent()?.navigate('Missions')} />
            {invitesOn ? <Button text={t('invite.title')} variant="soft" onPress={() => (navigation as any).getParent()?.navigate('Invite')} /> : null}
            <Button text={t('settings.openChallenges')} variant="soft" onPress={() => (navigation as any).getParent()?.navigate('ChallengesHub')} />
            <Button text={t('settings.openFriends')} variant="soft" onPress={() => (navigation as any).getParent()?.navigate('Friends')} />
            {cloudOn ? <Button text={t('sync.title')} variant="ghost" onPress={() => (navigation as any).getParent()?.navigate('SyncStatus')} /> : null}
          </Box>
        </Card>
      ) : null}

      {!storeBuild && (competitionsOn || marketplaceOn) ? (
        <Card tone="glow">
          <Text preset="h2">{t('settings.phase3Title')}</Text>
          <Text preset="muted">{t('settings.phase3Subtitle')}</Text>
          <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            {competitionsOn ? (
              <Button text={t('settings.openCompetitions')} variant="soft" onPress={() => (navigation as any).getParent()?.navigate('CompetitionsHub')} />
            ) : null}
            {marketplaceOn ? (
              <Button text={t('settings.openMarketplace')} variant="soft" onPress={() => (navigation as any).getParent()?.navigate('Marketplace')} />
            ) : null}
          </Box>
        </Card>
      ) : null}

      <Card>
        <Text preset="h2">{t('settings.audioTitle')}</Text>
        <Text preset="muted">{t('settings.noiseGateRms', { value: formatNumber(s.noiseGateRms, { maximumFractionDigits: 4, minimumFractionDigits: 4 }) })}</Text>
        <Box style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          <Button text={t('settings.gateMinus')} variant="soft" onPress={() => update({ ...s, noiseGateRms: clamp(s.noiseGateRms - 0.005, 0.005, 0.08) })} />
          <Button text={t('settings.gatePlus')} variant="soft" onPress={() => update({ ...s, noiseGateRms: clamp(s.noiseGateRms + 0.005, 0.005, 0.08) })} />
        </Box>

        <Text preset="muted">{t('settings.sensitivity', { value: formatNumber(s.sensitivity, { maximumFractionDigits: 2, minimumFractionDigits: 2 }) })}</Text>
        <Box style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          <Button text={t('settings.sensMinus')} variant="soft" onPress={() => update({ ...s, sensitivity: clamp(s.sensitivity - 0.1, 0.5, 2) })} />
          <Button text={t('settings.sensPlus')} variant="soft" onPress={() => update({ ...s, sensitivity: clamp(s.sensitivity + 0.1, 0.5, 2) })} />
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('settings.coachingTitle')}</Text>
        <Text preset="muted">{t('settings.voiceCoaching', { value: s.voiceCoaching ? t('common.on') : t('common.off') })}</Text>
        <Button text={s.voiceCoaching ? t('settings.turnOff') : t('settings.turnOn')} onPress={() => update({ ...s, voiceCoaching: !s.voiceCoaching })} />

        <Text preset="muted">{t('settings.coachPlayback', { value: s.coachPlayback ? t('common.on') : t('common.off') })}</Text>
        <Button text={s.coachPlayback ? t('settings.disablePlayback') : t('settings.enablePlayback')} onPress={() => update({ ...s, coachPlayback: !s.coachPlayback })} />

        <Text preset="muted">{t('settings.listenThenSing', { value: s.listenThenSing ? t('common.on') : t('common.off') })}</Text>
        <Button text={s.listenThenSing ? t('settings.disable') : t('settings.enable')} onPress={() => update({ ...s, listenThenSing: !s.listenThenSing })} />

        <Text preset="muted">{t('settings.celebrationSounds', { value: s.soundCues ? t('common.on') : t('common.off') })}</Text>
        <Button text={s.soundCues ? t('settings.disableSounds') : t('settings.enableSounds')} onPress={() => update({ ...s, soundCues: !s.soundCues })} />
      </Card>

      <Card>
        <Text preset="h2">{t('settings.trainingProgramTitle')}</Text>
        <Text preset="muted">{t('settings.trainingProgramSubtitle')}</Text>
        <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <Button
            text={t('settings.programPhase1')}
            variant={(s.activeCurriculum ?? 'phase1') === 'phase1' ? 'primary' : 'soft'}
            onPress={() => update({ ...s, activeCurriculum: 'phase1' })}
          />
          <Button
            text={t('settings.programProRegimen')}
            variant={(s.activeCurriculum ?? 'phase1') === 'pro_regimen' ? 'primary' : 'soft'}
            onPress={() => update({ ...s, activeCurriculum: 'pro_regimen' })}
          />
          <Button
            text={t('settings.programProRegimen12')}
            variant={(s.activeCurriculum ?? 'phase1') === 'pro_regimen12' ? 'primary' : 'soft'}
            onPress={() => update({ ...s, activeCurriculum: 'pro_regimen12' })}
          />
        </Box>

        {(s.activeCurriculum ?? 'phase1') === 'pro_regimen12' ? (
          <Box style={{ marginTop: 12, gap: 8 }}>
            <Text preset="muted">{t('settings.trainingTrackTitle')}</Text>
            <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <Button
                text={t('settings.trackBeginner')}
                variant={(s.activeTrack ?? 'beginner') === 'beginner' ? 'primary' : 'soft'}
                onPress={() => update({ ...s, activeTrack: 'beginner' })}
              />
              <Button
                text={t('settings.trackIntermediate')}
                variant={(s.activeTrack ?? 'beginner') === 'intermediate' ? 'primary' : 'soft'}
                onPress={() => update({ ...s, activeTrack: 'intermediate' })}
              />
              <Button
                text={t('settings.trackAdvanced')}
                variant={(s.activeTrack ?? 'beginner') === 'advanced' ? 'primary' : 'soft'}
                onPress={() => update({ ...s, activeTrack: 'advanced' })}
              />
            </Box>
          </Box>
        ) : null}
      </Card>

      {/* Pro polish + privacy + premium quality controls */}
      <Card tone="glow">
        <Text preset="h2">{t('settings.proTitle')}</Text>
        <Text preset="muted">{pro ? t('settings.proActive') : t('settings.proUpsell')}</Text>

        <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <Button text={t('settings.openBilling')} variant="soft" onPress={() => (navigation as any).getParent()?.navigate('Billing')} />
          <Button text={t('settings.privacy')} variant="ghost" onPress={() => (navigation as any).getParent()?.navigate('Privacy')} />
          <Button text={t('settings.terms')} variant="ghost" onPress={() => (navigation as any).getParent()?.navigate('Terms')} />
        </Box>

        <Box style={{ height: 10 }} />

        <Box style={{ gap: 8 }}>
          <Text weight="semibold">{t('settings.telemetryTitle')}</Text>
          <Text preset="muted">
            {t('settings.telemetryCrash', { value: (s.telemetryCrashReportingEnabled ?? false) ? t('common.on') : t('common.off') })}
          </Text>
          <Button
            text={(s.telemetryCrashReportingEnabled ?? false) ? t('settings.turnOff') : t('settings.turnOn')}
            variant="soft"
            onPress={async () => {
              const next = !(s.telemetryCrashReportingEnabled ?? false)
              await setCrashReportingEnabled(next)
              await update({ ...s, telemetryCrashReportingEnabled: next })
            }}
          />
          <Text preset="muted">{t('settings.telemetryNote')}</Text>
        </Box>

        <Box style={{ height: 10 }} />

        <Box style={{ gap: 8 }}>
          <Text weight="semibold">{t('settings.qualityTitle')}</Text>
          <Text preset="muted">{t('settings.qualitySubtitle')}</Text>
          <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            {(['AUTO', 'HIGH', 'BALANCED', 'LITE'] as const).map((m, idx) => (
              <Button
                key={`${m}-${idx}`}
                text={m}
                variant={(s.qualityMode ?? 'AUTO') === m ? 'primary' : 'soft'}
                onPress={async () => {
                  // Persist user intent; runtime will adapt only when AUTO.
                  const next = { ...s, qualityMode: m }
                  await update(next)
                  const { setQualityOverride } = await import('@/core/perf/qualityRuntime')
                  await setQualityOverride(m)
                }}
              />
            ))}
          </Box>
        </Box>

        {__DEV__ ? (
          <Box style={{ marginTop: 12, gap: 8 }}>
            <Text weight="semibold">{t('settings.perfLogTitle')}</Text>
            <Text preset="muted">{t('settings.perfLogSubtitle')}</Text>
            <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <Button
                text={t('settings.perfLogStart')}
                variant="soft"
                onPress={async () => {
                  const { startPerfLogging } = await import('@/core/perf/perfLog')
                  startPerfLogging()
                }}
              />
              <Button
                text={t('settings.perfLogStop')}
                variant="soft"
                onPress={async () => {
                  const { stopPerfLogging } = await import('@/core/perf/perfLog')
                  stopPerfLogging()
                }}
              />
              <Button
                text={t('settings.perfLogExport')}
                variant="primary"
                onPress={async () => {
                  const { exportPerfLog } = await import('@/core/perf/perfLog')
                  await exportPerfLog()
                }}
              />
            </Box>
            <Text preset="muted">{t('settings.perfLogAnalyzeHint')}</Text>
          </Box>
        ) : null}

        <Box style={{ marginTop: 10, gap: 6 }}>
          <Text preset="muted">{t('settings.ghostAdvanced', { value: s.ghostAdvanced ? t('common.on') : t('common.off') })}</Text>
          <Button
            text={s.ghostAdvanced ? t('settings.turnOff') : (pro ? t('settings.turnOn') : t('settings.unlockPro'))}
            variant={pro ? 'primary' : 'soft'}
            onPress={() => {
              if (!pro) return (navigation as any).getParent()?.navigate('Billing')
              return update({ ...s, ghostAdvanced: !s.ghostAdvanced })
            }}
          />
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('settings.remindersTitle')}</Text>
        <Text preset="muted">{t('settings.remindersSubtitle')}</Text>

        <Text preset="muted">{t('settings.remindersEnabled', { value: s.remindersEnabled ? t('common.on') : t('common.off') })}</Text>
        <Button
          text={s.remindersEnabled ? t('settings.turnOff') : t('settings.turnOn')}
          onPress={() => update({ ...s, remindersEnabled: !s.remindersEnabled })}
        />

        <Text preset="muted">
          {t('settings.reminderTime', {
            value: `${String(s.reminderHour ?? 19).padStart(2, '0')}:${String(s.reminderMinute ?? 0).padStart(2, '0')}`,
          })}
        </Text>
        <Box style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <Button
            text={t('settings.hourMinus')}
            variant="soft"
            onPress={() => update({ ...s, reminderHour: ((s.reminderHour ?? 19) + 23) % 24 })}
          />
          <Button
            text={t('settings.hourPlus')}
            variant="soft"
            onPress={() => update({ ...s, reminderHour: ((s.reminderHour ?? 19) + 1) % 24 })}
          />
          <Button
            text={t('settings.minMinus')}
            variant="soft"
            onPress={() => update({ ...s, reminderMinute: (((s.reminderMinute ?? 0) + 60) - 15) % 60 })}
          />
          <Button
            text={t('settings.minPlus')}
            variant="soft"
            onPress={() => update({ ...s, reminderMinute: ((s.reminderMinute ?? 0) + 15) % 60 })}
          />
        </Box>
      </Card>

      <Card>
        <Text preset="h2">{t('settings.languageTitle')}</Text>
        <Text preset="muted">{t('settings.languageCurrent', { value: s.language })}</Text>
        <Box style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          {LANGS.map((l, idx) => (
            <Button key={`${l}-${idx}`} text={l.toUpperCase()} variant={l === s.language ? "primary" : "ghost"} onPress={() => update({ ...s, language: l })} />
          ))}
        </Box>
      </Card>

      {showDev ? (
        <Card tone="glow">
          <Text preset="h2">{t('settings.qaTitle')}</Text>
          <Text preset="muted">{t('settings.qaSubtitle')}</Text>

          <Button text={t('dev.openComponentLab', 'Open UI Sandbox')} variant="soft" onPress={() => (navigation as any).getParent()?.navigate('SandboxHub')} />
          <Button text={t('dev.componentLab', 'Open Component Playground')} variant="ghost" onPress={() => (navigation as any).getParent()?.navigate('ComponentPlayground')} />

          <Button text={t('dev.openRepeatability')} variant="soft" onPress={() => (navigation as any).getParent()?.navigate('DevRepeatability')} />

          <Button text={t('settings.openBilling')} variant="soft" onPress={() => (navigation as any).getParent()?.navigate('Billing')} />
          <Button text={t('settings.openAdminContent')} variant="soft" onPress={() => (navigation as any).getParent()?.navigate('AdminContent')} />

          <Button text={t('settings.openModTools')} variant="soft" onPress={() => (navigation as any).getParent()?.navigate('ModTools')} />

          <Button text={t('dev.exportDebug')} variant="soft" onPress={shareDebug} testID="btn-debug-export" />

          <Button text={t('dev.rtlTestMode') ?? 'Toggle RTL test mode'} variant="soft" onPress={toggleRtl} />

          {showDiag ? (
            <Button text={t('settings.openDiagnostics')} variant="primary" onPress={() => (navigation as any).getParent()?.navigate('Diagnostics')} />
          ) : null}

          <Text preset="muted">{t('settings.simulatedMic', { value: s.qaSimulatedMic ? t('common.on') : t('common.off') })}</Text>
          <Button
            text={s.qaSimulatedMic ? t('settings.disableSimulatedMic') : t('settings.enableSimulatedMic')}
            variant="soft"
            onPress={() => update({ ...s, qaSimulatedMic: !s.qaSimulatedMic })}
          />

          <Text preset="muted">{t('settings.bypassMicPermission', { value: s.qaBypassMicPermission ? t('common.on') : t('common.off') })}</Text>
          <Button
            text={s.qaBypassMicPermission ? t('settings.disableBypass') : t('settings.enableBypass')}
            variant="soft"
            onPress={() => update({ ...s, qaBypassMicPermission: !s.qaBypassMicPermission })}
          />

          <Text preset="muted">{t('settings.mockShareSheet', { value: s.qaMockShare ? t('common.on') : t('common.off') })}</Text>
          <Button
            text={s.qaMockShare ? t('settings.disableMockShare') : t('settings.enableMockShare')}
            variant="soft"
            onPress={() => update({ ...s, qaMockShare: !s.qaMockShare })}
          />

          <Text preset="muted">{t('settings.devPerfOverlay', { value: s.devPerfOverlayEnabled ? t('common.on') : t('common.off') })}</Text>
          <Button
            text={s.devPerfOverlayEnabled ? t('settings.disableDevPerfOverlay') : t('settings.enableDevPerfOverlay')}
            variant="soft"
            onPress={() => update({ ...s, devPerfOverlayEnabled: !s.devPerfOverlayEnabled })}
          />
        </Card>
      ) : null}

      <Card>
        <Text preset="h2">{t('settings.recordingInputTitle') ?? 'Recording input'}</Text>
        <Text preset="muted">{t('settings.recordingInputSubtitle') ?? 'Choose safer defaults for microphones.'}</Text>

        <Box style={{ gap: 10, marginTop: 10 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('settings.allowBluetoothMic')}
            onPress={() => update({ ...s, allowBluetoothMic: !(s.allowBluetoothMic ?? true) })}
          >
            <Text>
              {(s.allowBluetoothMic ?? true) ? '✅ ' : '⬜️ '}
              {t('settings.allowBluetoothMic')}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('settings.preferBuiltInMic')}
            onPress={() => update({ ...s, preferBuiltInMic: !(s.preferBuiltInMic ?? false) })}
          >
            <Text>
              {(s.preferBuiltInMic ?? false) ? '✅ ' : '⬜️ '}
              {t('settings.preferBuiltInMic')}
            </Text>
          </Pressable>

          <Button
            text={t('settings.resetPreferredMic') ?? 'Reset preferred mic'}
            variant="soft"
            onPress={() => update({ ...s, preferredInputUid: null })}
          />
        </Box>
      </Card>

    </Screen>
  )
}

function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x))
}
